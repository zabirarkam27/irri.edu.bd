import assert from "node:assert/strict";
import { once } from "node:events";
import { execFile, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import test from "node:test";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/lib/prisma.js";
import { verifyRecovery } from "./recovery-drill.mjs";
import { verifyBrowser } from "./browser-qa.mjs";

test("CMS authorization, news lifecycle and optional frontend integration", async (t) => {
  const database = new URL(process.env.DATABASE_URL);
  assert.equal(database.hostname, "127.0.0.1");
  assert.equal(database.pathname, "/irri_phase1");
  const verifyFrontend = process.env.PHASE1_VERIFY_FRONTEND === "1";
  const server = app.listen(verifyFrontend ? 5000 : 0, "127.0.0.1");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const api = (path, options) => fetch(`${base}/api/v1${path}`, options);

  assert.equal((await fetch(`${base}/ready`)).status, 200);
  assert.equal((await api("/auth/me")).status, 401);
  assert.equal((await api("/auth/me", { headers: { Authorization: "Bearer invalid" } })).status, 401);
  assert.equal((await api("/news?page=0")).status, 400);
  const permittedOrigin = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "http://localhost:3000";
  const allowed = await api("/news", { headers: { Origin: permittedOrigin } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), permittedOrigin);
  assert.ok(allowed.headers.get("x-content-type-options"));
  const unrelated = await api("/news", { headers: { Origin: "https://unrelated.example.test" } });
  assert.equal(unrelated.headers.get("access-control-allow-origin"), null);

  const email = process.env.SEED_ADMIN_EMAIL;
  const response = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: process.env.SEED_ADMIN_PASSWORD })
  });
  assert.equal(response.status, 200);
  const { data } = await response.json();
  const headers = { Authorization: `Bearer ${data.token}`, "Content-Type": "application/json" };
  assert.equal((await api("/auth/me", { headers })).status, 200);
  assert.equal((await api("/audit-logs", { headers })).status, 200);
  assert.equal((await api("/news", {
    method: "POST", headers, body: JSON.stringify({ title: "Test", content: "Test", role: "SUPER_ADMIN" })
  })).status, 400);

  const expired = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await api("/auth/me", { headers: { Authorization: `Bearer ${expired}` } })).status, 401);

  await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
  try {
    assert.equal((await api("/audit-logs", { headers })).status, 403);
    assert.equal((await api("/news/missing", { method: "DELETE", headers })).status, 403);
    await prisma.user.update({ where: { email }, data: { isActive: false } });
    assert.equal((await api("/auth/me", { headers })).status, 401);
  } finally {
    await prisma.user.update({ where: { email }, data: { role: data.user.role, isActive: true } });
  }

  const slug = `news-${randomUUID()}`;
  const article = { title: "Integration news", slug, content: "Original content", status: "DRAFT" };
  assert.equal((await api("/admin/news")).status, 401);
  const save = (path, method, body) => api(path, { method, headers, body: JSON.stringify(body) });
  await t.test("role boundaries for editorial, media, inbox and user management", async () => {
    const key = randomUUID();
    const seed = await prisma.user.findUniqueOrThrow({ where: { email }, select: { passwordHash: true } });
    const fixtures = [];
    try {
      const record = await prisma.page.create({ data: { title: "QA role fixture", content: "Private draft", slug: `qa-role-${key}` } });
      try {
        for (const role of ["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR"]) {
          let authorization = headers.Authorization;
          if (role !== "SUPER_ADMIN") {
            const user = await prisma.user.create({ data: {
              email: `${role.toLowerCase()}-${key}@example.test`, name: "QA role", role, passwordHash: seed.passwordHash
            } });
            fixtures.push(user.id);
            const loggedIn = await api("/auth/login", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, password: process.env.SEED_ADMIN_PASSWORD })
            });
            assert.equal(loggedIn.status, 200, role);
            authorization = `Bearer ${(await loggedIn.json()).data.token}`;
          }
          const asRole = (path, method = "GET", body) => api(path, { method,
            headers: { Authorization: authorization, "Content-Type": "application/json" },
            ...(body ? { body: JSON.stringify(body) } : {})
          });
          const admin = ["SUPER_ADMIN", "ADMIN"].includes(role);
          assert.equal((await (await asRole("/auth/me")).json()).data.role, role);
          assert.equal((await asRole(`/admin/pages/${record.id}`)).status, 200, role);
          assert.equal((await asRole("/admin/media")).status, 200, role);
          assert.equal((await asRole("/admin/inbox")).status, role === "EDITOR" ? 403 : 200, role);
          assert.equal((await asRole("/admin/audit-logs")).status, admin ? 200 : 403, role);
          assert.equal((await asRole("/admin/users")).status, admin ? 200 : 403, role);
          assert.equal((await asRole("/admin/release-settings")).status, admin ? 200 : 403, role);
          assert.equal((await asRole("/admin/users/nonexistent-qa", "PATCH", { isActive: false })).status, role === "SUPER_ADMIN" ? 404 : 403, role);
          await prisma.page.update({ where: { id: record.id }, data: { status: "DRAFT" } });
          const path = `/admin/pages/${record.id}/editorial`;
          assert.equal((await asRole(path, "POST", { action: "submit" })).status, role === "MODERATOR" ? 403 : 200, role);
          await prisma.page.update({ where: { id: record.id }, data: { status: "IN_REVIEW" } });
          assert.equal((await asRole(path, "POST", { action: "approve" })).status, role === "EDITOR" ? 403 : 200, role);
          await prisma.page.update({ where: { id: record.id }, data: { status: "APPROVED" } });
          assert.equal((await asRole(path, "POST", { action: "publish" })).status, admin ? 200 : 403, role);
          await prisma.page.update({ where: { id: record.id }, data: { status: "PUBLISHED" } });
          assert.equal((await asRole(path, "POST", { action: "archive" })).status, admin ? 200 : 403, role);
        }
      } finally {
        await prisma.page.delete({ where: { id: record.id } });
      }
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: fixtures } } });
    }
  });
  await t.test("public search and sitemap exclude unpublished and private records", async () => {
    const key = randomUUID();
    const published = await prisma.newsPost.create({ data: {
      title: `Search public ${key}`, titleBn: "বাংলা গবেষণা", content: "A published search fixture", slug: `public-${key}`, status: "PUBLISHED"
    } });
    const draft = await prisma.newsPost.create({ data: {
      title: `Search draft ${key}`, titleBn: "বাংলা গবেষণা", content: "Private draft", slug: `draft-${key}`, status: "DRAFT"
    } });
    const placeholder = await prisma.page.create({ data: {
      title: `Placeholder ${key}`, slug: `placeholder-${key}`, status: "PUBLISHED",
      content: `Placeholder ${key} content for International Rabindra Research Institute.`
    } });
    try {
      const request = (q, type = "") => api(`/search?${new URLSearchParams({ q, ...(type ? { type } : {}) })}`);
      const response = await request(key);
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).data.map((hit) => hit.slug), [published.slug]);
      const bangla = await (await request("বাংলা গবেষণা", "news")).json();
      assert.ok(bangla.data.some((hit) => hit.slug === published.slug));
      assert.ok(bangla.data.every((hit) => hit.slug !== draft.slug && hit.type === "news"));
      assert.deepEqual((await (await request(key, "events")).json()).data, []);
      assert.equal((await request(key, "users")).status, 400);
      const sitemap = (await (await api("/sitemap")).json()).data;
      assert.ok(sitemap.some((hit) => hit.slug === published.slug && hit.translated));
      assert.ok(sitemap.every((hit) => hit.slug !== draft.slug));
      assert.ok(sitemap.every((hit) => hit.slug !== placeholder.slug));
      assert.equal((await api(`/pages/${placeholder.slug}`)).status, 404);
    } finally {
      await prisma.newsPost.deleteMany({ where: { id: { in: [published.id, draft.id] } } });
      await prisma.page.delete({ where: { id: placeholder.id } });
    }
  });
  const transition = (path, action, fields = {}) => save(path + "/editorial", "POST", { action, ...fields });
  async function publish(path) {
    for (const action of ["submit", "approve", "publish"]) {
      const result = await transition(path, action);
      assert.equal(result.status, 200, `${path} ${action}: ${(await result.json()).message}`);
    }
  }
  assert.equal((await save("/admin/news", "POST", { title: "Missing content" })).status, 400);
  const created = await save("/admin/news", "POST", article);
  assert.equal(created.status, 201);
  const { data: post } = await created.json();
  const adminDetail = `/admin/news/${post.id}`;
  const publicDetail = `/news/${slug}`;
  try {
    assert.equal((await save("/admin/news", "POST", article)).status, 409);
    assert.equal((await api(adminDetail, { headers })).status, 200);
    assert.equal((await api(publicDetail)).status, 404);
    const drafts = await (await api(`/admin/news?status=DRAFT&search=${slug}&page=1&limit=1`, { headers })).json();
    assert.equal(drafts.meta.total, 0);
    const matches = await (await api("/admin/news?status=DRAFT&search=Integration%20news&limit=1", { headers })).json();
    assert.equal(matches.data.length, 1);
    assert.ok(matches.meta.total >= 1);
    assert.equal((await save(adminDetail, "PATCH", { status: "PUBLISHED" })).status, 409);
    assert.equal((await save(adminDetail, "PATCH", { content: "Updated content" })).status, 200);
    assert.equal((await transition(adminDetail, "publish")).status, 403);
    await publish(adminDetail);
    assert.equal((await (await api(publicDetail)).json()).data.content, "Updated content");
    assert.equal((await transition(adminDetail, "archive")).status, 200);
    assert.equal((await api(publicDetail)).status, 404);
    assert.equal((await api(`/news/${post.id}`)).status, 404);
    await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
    try {
      assert.equal((await api(adminDetail, { method: "DELETE", headers })).status, 403);
    } finally {
      await prisma.user.update({ where: { email }, data: { role: data.user.role } });
    }
    assert.equal((await api(adminDetail, { method: "DELETE", headers })).status, 200);
    assert.equal((await api(adminDetail, { headers })).status, 404);
  } finally {
    await prisma.newsPost.deleteMany({ where: { id: post.id } });
  }

  await t.test("all Phase 2 content resources and admin operations", async () => {
    const records = new Map();
    const resources = [
      ["pages", { title: "CMS page", content: "Page body" }],
      ["notices", { title: "CMS notice", content: "Notice body", publishedAt: "2026-01-01T00:00:00Z" }],
      ["events", { title: "CMS event", content: "Event body", startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-01-02T00:00:00Z" }],
      ["publications", { title: "CMS publication", author: "Test author", abstract: "Abstract", fileUrl: "https://example.test/book.pdf" }],
      ["people", { name: "CMS profile", designation: "Researcher", type: "RESEARCHER" }],
      ["departments", { name: "CMS department", description: null }],
      ["programs", { title: "CMS program", level: "Masters" }],
      ["courses", { title: "CMS course", credits: 3.5 }],
      ["gallery-albums", { title: "CMS album", description: "Album description" }],
      ["categories", { name: "CMS category", description: "Category description" }]
    ];
    try {
      for (const [resource, fields] of resources) {
        const slug = `cms-${randomUUID()}`;
        const status = resource === "categories" ? {} : { status: "DRAFT" };
        const affiliation = {
          ...(resource === "programs" || resource === "courses" ? { departmentId: records.get("departments").id } : {}),
          ...(resource === "courses" ? { programId: records.get("programs").id } : {})
        };
        const response = await save(`/admin/${resource}`, "POST", { ...fields, ...affiliation, ...status, slug });
        const body = await response.json();
        assert.equal(response.status, 201, `${resource}: ${body.message}`);
        records.set(resource, body.data);
        for (const [key, value] of Object.entries(affiliation)) assert.equal(body.data[key], value);
        const detail = `/admin/${resource}/${body.data.id}`;
        assert.equal((await api(detail)).status, 401);
        assert.equal((await api(detail, { headers })).status, 200);
        if ("status" in status) {
          assert.equal((await api(`/${resource}/${slug}`)).status, 404);
          await publish(detail);
          assert.equal((await api(`/${resource}/${slug}`)).status, 200);
          const isolatedSlug = `${slug}-updated`;
          assert.equal((await transition(detail, "return")).status, 200);
          assert.equal((await save(detail, "PATCH", { slug: isolatedSlug })).status, 200);
          assert.equal((await api(`/${resource}/${slug}`)).status, 404);
          await publish(detail);
          assert.equal((await api(`/${resource}/${isolatedSlug}`)).status, 200);
          assert.equal((await (await api(`/${resource}/${slug}`)).json()).data.slug, isolatedSlug);
          assert.equal((await transition(detail, "archive")).status, 200);
          assert.equal((await api(`/${resource}/${isolatedSlug}`)).status, 404);
          assert.equal((await transition(detail, "return")).status, 200);
        }
        const list = await api(`/admin/${resource}?search=CMS&limit=1&page=1`, { headers });
        assert.equal(list.status, 200);
        assert.equal((await list.json()).data.length, 1);
      }
      assert.equal((await save(`/admin/events/${records.get("events").id}`, "PATCH", { endsAt: "2025-01-01T00:00:00Z" })).status, 400);
      assert.equal((await save(`/admin/courses/${records.get("courses").id}`, "PATCH", { programId: "missing-program" })).status, 409);
      const about = await prisma.page.findUnique({ where: { slug: "about" } });
      if (about) {
        assert.ok([400, 409].includes((await save(`/admin/pages/${about.id}`, "PATCH", { slug: `test-${randomUUID()}` })).status));
      }
      assert.equal((await save(`/admin/publications/${records.get("publications").id}`, "PATCH", { fileUrl: "/uploads/test-file" })).status, 200);
      assert.equal((await api("/admin/dashboard", { headers })).status, 200);
      const audits = await api("/admin/audit-logs?entity=event&limit=1", { headers });
      assert.equal(audits.status, 200);
      assert.equal((await audits.json()).data[0].entity, "event");
    } finally {
      for (const [resource, record] of [...records.entries()].reverse()) {
        assert.equal((await api(`/admin/${resource}/${record.id}`, { method: "DELETE", headers })).status, 200);
      }
    }

    const contact = await api("/contact-messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Integration Tester", email: "inbox@example.test", subject: "Integration inbox", message: "A test inbox message." })
    });
    assert.equal(contact.status, 201);
    const { id: messageId } = (await contact.json()).data;
    try {
      assert.equal((await api("/admin/inbox")).status, 401);
      assert.equal((await save(`/admin/inbox/${messageId}`, "PATCH", { isRead: true })).status, 200);
      const inbox = await (await api("/admin/inbox?read=read&search=Integration%20inbox", { headers })).json();
      assert.ok(inbox.data.some((message) => message.id === messageId && message.isRead));
      assert.equal((await save(`/admin/inbox/${messageId}`, "PATCH", { isRead: false })).status, 200);
    } finally {
      await prisma.contactMessage.delete({ where: { id: messageId } });
    }
    const accounts = await (await api("/admin/users", { headers })).json();
    assert.ok(accounts.data.some((user) => user.id === data.user.id));
    assert.ok(accounts.data.every((user) => !("passwordHash" in user)));
    await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
    try {
      for (const path of ["users", "inbox", "audit-logs", "institution"]) {
        assert.equal((await api(`/admin/${path}`, { headers })).status, 403);
      }
      assert.equal((await api("/admin/dashboard", { headers })).status, 200);
    } finally {
      await prisma.user.update({ where: { email }, data: { role: data.user.role } });
    }
    const other = await prisma.user.create({ data: {
      email: `phase2-${randomUUID()}@example.test`, name: "Phase 2 test", passwordHash: "Test account cannot log in", role: "EDITOR"
    } });
    try {
      assert.equal((await save(`/admin/users/${other.id}`, "PATCH", { role: "MODERATOR", isActive: false })).status, 200);
      if (await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } }) === 1) {
        assert.equal((await save(`/admin/users/${data.user.id}`, "PATCH", { role: "ADMIN" })).status, 409);
        assert.equal((await save(`/admin/users/${data.user.id}`, "PATCH", { isActive: false })).status, 409);
      }
    } finally {
      await prisma.user.delete({ where: { id: other.id } });
    }
    const profile = await (await api("/admin/institution", { headers })).json();
    const { id: profileId, createdAt: _createdAt, updatedAt: _updatedAt, ...settings } = profile.data;
    const updated = await save("/admin/institution", "PUT", { ...settings, motto: "Phase 2 profile update" });
    assert.equal(updated.status, 200);
    try {
      assert.equal((await (await api("/institution")).json()).data.motto, "Phase 2 profile update");
    } finally {
      await prisma.institutionProfile.update({ where: { id: profileId }, data: settings });
    }
  });

  await t.test("private media lifecycle and scheduled publication", async (mediaTest) => {
    const image = await sharp({ create: { width: 800, height: 480, channels: 3, background: "#045c49" } }).png().toBuffer();
    const replacement = await sharp({ create: { width: 800, height: 480, channels: 3, background: "#253754" } }).png().toBuffer();
    const form = (bytes, filename, mime) => {
      const payload = new FormData();
      payload.set("file", new Blob([bytes], { type: mime }), filename);
      payload.set("altText", "Integration media");
      return payload;
    };
    const mediaRequest = (path, method, body) => api("/admin/media" + path, {
      method, headers: { Authorization: headers.Authorization }, body
    });
    const rejected = await mediaRequest("/upload", "POST", form(Buffer.from("not an image"), "fake.png", "image/png"));
    assert.equal(rejected.status, 400);
    const uploaded = await mediaRequest("/upload", "POST", form(image, "test.png", "image/png"));
    const { data: asset, message } = await uploaded.json();
    assert.equal(uploaded.status, 201, message);
    const privatePath = `/${asset.url.split("/").slice(3).join("/")}`;
    let album;
    let attachment;
    try {
      assert.equal((await api(privatePath)).status, 404);
      assert.equal((await api(`/admin/media/${asset.id}/file`)).status, 401);
      const thumb = await mediaRequest(`/${asset.id}/file?thumb=1`, "GET");
      assert.equal(thumb.status, 200);
      assert.equal(thumb.headers.get("content-type"), "image/webp");
      assert.equal((await sharp(Buffer.from(await thumb.arrayBuffer())).metadata()).width, 640);
      assert.equal((await mediaRequest(`/${asset.id}/file`, "PUT", form(replacement, "replacement.png", "image/png"))).status, 200);
      const slug = `media-${randomUUID()}`;
      const created = await save("/admin/gallery-albums", "POST", { title: "Media integration album", slug });
      assert.equal(created.status, 201);
      album = (await created.json()).data;
      const added = await save(`/admin/media/gallery/${album.id}`, "POST", { assetId: asset.id, altText: "Image in album", caption: "Test caption", order: 1 });
      assert.equal(added.status, 201);
      attachment = (await added.json()).data;
      assert.equal((await mediaRequest(`/${asset.id}`, "DELETE")).status, 409);
      assert.equal((await api(privatePath)).status, 404);
      const path = `/admin/gallery-albums/${album.id}`;
      assert.equal((await transition(path, "submit")).status, 200);
      assert.equal((await transition(path, "approve", { comment: "Reviewed fixture" })).status, 200);
      assert.equal((await api(privatePath)).status, 404);
      const secret = process.env.CRON_SECRET;
      if (secret) {
        assert.equal((await api("/editorial/run")).status, 401);
        assert.equal((await transition(path, "schedule", { scheduledAt: new Date(Date.now() + 120_000).toISOString() })).status, 200);
        assert.equal((await api(privatePath)).status, 404);
        await prisma.publicationSchedule.update({
          where: { model_recordId: { model: "galleryAlbum", recordId: album.id } },
          data: { scheduledAt: new Date(Date.now() - 1000) }
        });
        const run = () => api("/editorial/run", { headers: { Authorization: `Bearer ${secret}` } });
        assert.equal((await (await run()).json()).data.published, 1);
        assert.equal((await (await run()).json()).data.published, 0);
      } else {
        assert.equal((await transition(path, "publish")).status, 200);
      }
      const publicFile = await api(privatePath);
      assert.equal(publicFile.status, 200);
      assert.equal(publicFile.headers.get("cache-control"), "private, no-store");
      assert.deepEqual(Buffer.from(await publicFile.arrayBuffer()), replacement);
      if (process.env.PHASE7_VERIFY_RESTORE === "1") {
        const stored = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
        await mediaTest.test("restore PostgreSQL and verify recovered media bytes", () => verifyRecovery(stored, replacement));
      }
      assert.equal((await transition(path, "archive")).status, 200);
      assert.equal((await api(privatePath)).status, 404);
      assert.equal((await transition(path, "return")).status, 200);
      assert.equal((await mediaRequest(`/gallery/images/${attachment.id}`, "DELETE")).status, 200);
      attachment = undefined;
      assert.equal((await mediaRequest(`/${asset.id}`, "DELETE")).status, 200);
      assert.equal((await mediaRequest(`/${asset.id}/file`, "GET")).status, 404);
    } finally {
      if (attachment) await prisma.galleryImage.deleteMany({ where: { id: attachment.id } });
      if (album) {
        await prisma.publicationSchedule.deleteMany({ where: { model: "galleryAlbum", recordId: album.id } });
        await prisma.galleryAlbum.deleteMany({ where: { id: album.id } });
      }
      await mediaRequest(`/${asset.id}`, "DELETE");
    }
  });

  await t.test("academic relationships, catalogue rights and calendar export", async () => {
    const key = randomUUID();
    const created = [];
    const create = async (resource, model, fields) => {
      const response = await save(`/admin/${resource}`, "POST", { slug: `${model}-${key}`, ...fields });
      const { data: item, message } = await response.json();
      assert.equal(response.status, 201, `${resource}: ${message}`);
      created.push([model, item.id]);
      return item;
    };
    const list = async (path) => (await (await api(path)).json()).data;
    const document = Buffer.from("%PDF-1.4\n%%EOF\n");
    const upload = () => {
      const form = new FormData();
      form.set("file", new Blob([document], { type: "application/pdf" }), "academic.pdf");
      return form;
    };
    const media = (path, method, body) => api(`/admin/media${path}`, { method, body, headers: { Authorization: headers.Authorization } });
    let file;
    try {
      const department = await create("departments", "department", { name: "Integration department", unitType: "Department" });
      const person = await create("people", "person", { name: "Integration researcher", designation: "Researcher", type: "RESEARCHER", departmentId: department.id });
      const program = await create("programs", "program", { title: "Integration program", level: "Certificate", departmentId: department.id });
      const prerequisite = await create("courses", "course", { title: "Integration prerequisite", slug: `prerequisite-${key}` });
      const course = await create("courses", "course", { title: "Integration course", programId: program.id, instructorId: person.id, prerequisiteIds: [prerequisite.id] });
      const adminCourse = await api(`/admin/courses/${course.id}`, { headers });
      assert.deepEqual((await adminCourse.json()).data.prerequisiteIds, [prerequisite.id]);
      const area = await create("research-areas", "researchArea", { title: "Integration area", departmentId: department.id });
      const project = await create("research-projects", "researchProject", { title: "Integration project", areaId: area.id, departmentId: department.id, teamIds: [person.id] });
      const publication = await create("publications", "publication", { title: "Integration publication", projectId: project.id, contributorIds: [person.id], citation: "Integration citation." });
      for (const [resource, item] of [["departments", department], ["programs", program], ["courses", course],
        ["research-areas", area], ["research-projects", project], ["publications", publication]]) {
        await publish(`/admin/${resource}/${item.id}`);
      }
      assert.ok((await list(`/courses/${course.slug}`)).related.every(({ label }) => !["Prerequisites", "Instructor"].includes(label)));
      await publish(`/admin/people/${person.id}`);
      assert.ok((await list(`/research-projects/${project.slug}`)).related.some(({ label, records }) => label === "Project team" && records[0].id === person.id));
      assert.ok((await list(`/publications/${publication.slug}`)).related.some(({ label }) => label === "Contributors"));
      assert.ok((await list(`/departments/${department.slug}`)).related.some(({ label }) => label === "Research projects"));

      const uploaded = await media("/upload", "POST", upload());
      assert.equal(uploaded.status, 201);
      file = (await uploaded.json()).data;
      const asset = await create("academic-assets", "academicAsset", { title: `Rights test ${key}`, kind: "REPOSITORY", fileUrl: file.url });
      assert.equal(asset.access, "PRIVATE");
      const path = `/admin/academic-assets/${asset.id}`;
      const assetPath = `/academic-assets/${asset.slug}`;
      const filePath = file.url.slice("/api/v1".length);
      await publish(path);
      assert.equal((await api(assetPath)).status, 404);
      assert.equal((await api(filePath + "?preview=1")).status, 404);
      assert.equal((await media(`/${file.id}/file`, "GET")).status, 200);
      assert.equal((await media(`/${file.id}/file`, "PUT", upload())).status, 409);
      assert.equal((await transition(path, "return")).status, 200);
      const rights = { rightsStatement: "Distribution authorized", rightsEvidence: "Internal approval reference" };
      await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
      try {
        assert.equal((await save(path, "PATCH", { ...rights, rightsVerified: true })).status, 403);
      } finally {
        await prisma.user.update({ where: { email }, data: { role: data.user.role } });
      }
      assert.equal((await save(path, "PATCH", { access: "PUBLIC" })).status, 200);
      for (const action of ["submit", "approve"]) assert.equal((await transition(path, action)).status, 200);
      assert.equal((await transition(path, "publish")).status, 409);
      assert.equal((await transition(path, "return")).status, 200);
      assert.equal((await save(path, "PATCH", { ...rights, rightsVerified: true })).status, 200);
      await publish(path);
      const publicAsset = await list(assetPath);
      assert.equal(publicAsset.rightsStatement, rights.rightsStatement);
      assert.ok(!("rightsEvidence" in publicAsset) && !("rightsApprovedBy" in publicAsset));
      assert.equal((await list(`/academic-assets?kind=REPOSITORY&search=${key}`)).length, 1);
      const preview = await api(filePath + "?preview=1");
      assert.equal(preview.status, 200);
      assert.match(preview.headers.get("content-disposition"), /^inline/);
      assert.deepEqual(Buffer.from(await preview.arrayBuffer()), document);
      await prisma.academicAsset.update({ where: { id: asset.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal((await api(assetPath)).status, 404);
      assert.equal((await api(filePath)).status, 404);

      const entry = await create("events", "event", { title: `Academic, session ${key}`, content: "Published event", startsAt: "2030-01-02T09:00:00Z", academicCalendar: true });
      await create("events", "event", { title: `Draft session ${key}`, slug: `draft-event-${key}`, content: "Draft", startsAt: "2030-01-02T09:00:00Z", academicCalendar: true });
      await publish(`/admin/events/${entry.id}`);
      const calendar = await api("/academic-calendar.ics");
      assert.match(calendar.headers.get("content-type"), /^text\/calendar/);
      const body = await calendar.text();
      assert.ok(body.includes("SUMMARY:Academic\\, session"));
      assert.ok(!body.includes(`Draft session ${key}`));
      assert.ok(body.split("\r\n").every((line) => Buffer.byteLength(line) <= 75));
    } finally {
      for (const [model, id] of created.reverse()) await prisma[model].delete({ where: { id } });
      if (file) await media(`/${file.id}`, "DELETE");
    }
  });

  if (verifyFrontend) {
    const origin = "http://127.0.0.1:3301";
    const requireFrontend = createRequire(new URL("../../frontend/package.json", import.meta.url));
    const frontend = spawn(process.execPath, [
      requireFrontend.resolve("next/dist/bin/next"),
      "start", "-H", "127.0.0.1", "-p", "3301"
    ], {
      cwd: fileURLToPath(new URL("../../frontend/", import.meta.url)),
      env: {
        ...process.env, NODE_ENV: "production", AUTH_URL: origin, NEXTAUTH_URL: origin,
        NEXT_IGNORE_INCORRECT_LOCKFILE: "1"
      },
      stdio: "inherit"
    });
    t.after(async () => {
      if (frontend.exitCode !== null) return;
      const closed = once(frontend, "close");
      frontend.kill();
      await closed;
    });
    const cookies = new Map();
    async function visit(path, form) {
      const result = await fetch(origin + path, {
        redirect: "manual",
        headers: { Cookie: [...cookies.values()].join("; "), ...(form ? { Origin: origin } : {}) },
        ...(form ? { method: "POST", body: form instanceof FormData ? form : new URLSearchParams(form) } : {})
      });
      for (const cookie of result.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const separator = pair.indexOf("=");
        const name = pair.slice(0, separator);
        if (pair.length === separator + 1) cookies.delete(name);
        else cookies.set(name, pair);
      }
      return result;
    }
    let csrfResponse;
    for (let attempt = 0; attempt < 40 && !csrfResponse; attempt++) {
      csrfResponse = await visit("/api/auth/csrf").catch(() => null);
      if (!csrfResponse) await delay(250);
    }
    assert.equal(csrfResponse?.status, 200);
    await promisify(execFile)(process.execPath, [fileURLToPath(new URL("../../scripts/production-smoke.mjs", import.meta.url))], {
      env: { ...process.env, SMOKE_FRONTEND_ORIGIN: origin, SMOKE_BACKEND_ORIGIN: base }
    });
    if (process.env.PHASE7_VERIFY_BROWSER === "1") {
      await t.test("responsive, keyboard and automated accessibility smoke", () => verifyBrowser(origin));
    }
    const admissionsPage = await prisma.page.create({ data: {
      slug: "admissions", title: "Admissions", content: "Unpublished admission guidance",
      contentBn: "বাংলা ভর্তি নির্দেশনার নমুনা", status: "DRAFT"
    } });
    const draftProgram = await prisma.program.create({ data: {
      slug: `draft-admission-${randomUUID()}`, title: "Nonpublic admission program", level: "Certificate"
    } });
    try {
      const draftView = await visit("/admissions");
      assert.equal(draftView.status, 200);
      const draftHtml = await draftView.text();
      assert.match(draftHtml, /No admission guidance has been published yet/);
      assert.doesNotMatch(draftHtml, /Unpublished admission guidance|Nonpublic admission program/);
      await publish(`/admin/pages/${admissionsPage.id}`);
      await publish(`/admin/programs/${draftProgram.id}`);
      const published = await (await visit("/admissions")).text();
      assert.match(published, /Unpublished admission guidance/);
      assert.match(published, new RegExp(`href="/academic-programs/${draftProgram.slug}"`));
      assert.doesNotMatch(published, /name="(?:applicant|document|payment)"/);
      const banglaAdmissions = await (await visit("/bn/admissions")).text();
      assert.match(banglaAdmissions, /<html lang="bn"/);
      assert.match(banglaAdmissions, /বাংলা ভর্তি নির্দেশনার নমুনা/);
      assert.match(banglaAdmissions, /href="\/bn\/academic-assets\?kind=RESOURCE"/);
      assert.match(await (await visit("/sitemap.xml")).text(), /\/bn\/admissions/);
    } finally {
      await prisma.program.delete({ where: { id: draftProgram.id } });
      await prisma.page.delete({ where: { id: admissionsPage.id } });
    }
    const localizedSlug = `bn-${randomUUID()}`;
    const localizedPost = await prisma.newsPost.create({ data: {
      title: "Bilingual search fixture", titleBn: "বাংলা অনুসন্ধান পরীক্ষা", content: "English fixture.",
      contentBn: "বাংলা নিবন্ধের বিষয়বস্তু।", slug: localizedSlug, status: "PUBLISHED"
    } });
    try {
      const bn = await visit(`/bn/news/${localizedSlug}`);
      assert.equal(bn.status, 200);
      const markup = await bn.text();
      assert.match(markup, /<html lang="bn"/);
      assert.match(markup, /বাংলা নিবন্ধের বিষয়বস্তু/);
      assert.match(markup, new RegExp(`hreflang="bn" href="[^"]+/bn/news/${localizedSlug}"`, "i"));
      const en = await (await visit(`/news/${localizedSlug}`)).text();
      assert.match(en, /<html lang="en"/);
      assert.match(en, /English fixture/);
      const query = new URLSearchParams({ q: "বাংলা অনুসন্ধান পরীক্ষা", type: "news" });
      const search = await (await visit(`/bn/search?${query}`)).text();
      assert.match(search, new RegExp(`href="/bn/news/${localizedSlug}"`));
      assert.match(await (await visit("/sitemap.xml")).text(), new RegExp(`/bn/news/${localizedSlug}`));
      assert.equal((await visit("/bn/admin/news")).status, 404);
    } finally {
      await prisma.newsPost.delete({ where: { id: localizedPost.id } });
    }
    assert.ok([302, 307].includes((await visit("/admin/dashboard")).status));
    const { csrfToken } = await csrfResponse.json();
    const login = await visit("/api/auth/callback/credentials", {
      email, password: process.env.SEED_ADMIN_PASSWORD, csrfToken, callbackUrl: origin + "/admin/dashboard"
    });
    assert.ok([302, 303].includes(login.status));
    assert.equal((await visit("/admin/dashboard")).status, 200);
    const session = await (await visit("/api/auth/session")).json();
    assert.equal(session.user.email, email);
    assert.ok(!JSON.stringify(session).includes("backendToken"));
    assert.match(await (await visit("/admin/news")).text(), /New post/);
    async function submitAdminForm(path, marker, fields, expected = 303) {
      const response = await visit(path);
      assert.equal(response.status, 200);
      const markup = await response.text();
      const formMarkup = [...markup.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)]
        .map(([html]) => html).find((html) => html.includes(`name="${marker}"`));
      assert.ok(formMarkup, "Admin form is present");
      const actionInputs = [...formMarkup.matchAll(/<input type="hidden" name="(\$ACTION_[^"]+)"(?: value="([^"]*)")?\/?\s*>/g)];
      assert.ok(actionInputs.length > 0, "Server Action form inputs are present");
      const form = new FormData();
      for (const [, name, value = ""] of actionInputs) {
        form.set(name, value.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&"));
      }
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      const saved = await visit(path, form);
      assert.equal(saved.status, expected, `Form submission: ${path}`);
    }
    const uiSlug = `ui-${randomUUID()}`;
    const priorSettings = await prisma.releaseSettings.findUnique({ where: { id: "production" } });
    try {
      const partial = await save("/admin/release-settings", "PUT", {
        releaseOwner: null, rollbackOwner: null, alertDestination: null,
        releaseStartsAt: "2030-05-10T11:30:00+06:00", releaseEndsAt: null
      });
      assert.equal(partial.status, 400);
      assert.equal((await api("/admin/release-settings")).status, 401);
      await submitAdminForm("/admin/settings", "releaseOwner", {
        releaseOwner: "QA Release Owner", rollbackOwner: "QA Rollback Owner", alertDestination: "QA Internal Channel",
        releaseStartsAt: "2030-05-10T11:30", releaseEndsAt: "2030-05-10T12:30"
      }, 200);
      const config = await api("/admin/release-settings", { headers });
      assert.equal(config.headers.get("cache-control"), "private, no-store");
      const settings = (await config.json()).data;
      assert.equal(settings.releaseStartsAt, "2030-05-10T05:30:00.000Z");
      assert.equal(settings.alertDestination, "QA Internal Channel");
      assert.match(await (await visit("/admin/settings")).text(), /2030-05-10T11:30:00/);
      assert.doesNotMatch(await (await api("/institution")).text(), /QA Internal Channel/);
    } finally {
      if (priorSettings) await prisma.releaseSettings.update({ where: { id: "production" }, data: priorSettings });
      else await prisma.releaseSettings.deleteMany({ where: { id: "production" } });
    }
    const fields = {
      title: "News created through admin form",
      slug: uiSlug,
      content: "Published through the real admin server action.",
      status: "DRAFT"
    };
    try {
      await submitAdminForm("/admin/news/new", "title", fields);
      const { id } = await prisma.newsPost.findUniqueOrThrow({ where: { slug: uiSlug }, select: { id: true } });
      assert.equal((await api(`/news/${uiSlug}`)).status, 404);
      for (const action of ["submit", "approve", "publish"]) {
        await submitAdminForm(`/admin/news/${id}`, "comment", { action }, 200);
      }
      assert.match(await (await visit(`/news/${uiSlug}`)).text(), /Published through the real admin server action/);
      assert.match(await (await visit("/")).text(), /News created through admin form/);
      await submitAdminForm(`/admin/news/${id}`, "comment", { action: "return" }, 200);
      await submitAdminForm(`/admin/news/${id}/edit`, "title", { ...fields, status: "DRAFT", content: "Edited draft content" });
      const unpublished = await visit(`/news/${uiSlug}`);
      // Next.js can stream an HTTP 200 before rendering its not-found boundary.
      assert.ok([200, 404].includes(unpublished.status));
      const unpublishedMarkup = await unpublished.text();
      assert.doesNotMatch(unpublishedMarkup, /Edited draft content|Published through the real admin server action/);
      assert.match(await (await visit(`/admin/news/${id}`)).text(), /Edited draft content/);
      await submitAdminForm(`/admin/news/${id}`, "confirmed", { confirmed: "yes" });
      assert.equal(await prisma.newsPost.count({ where: { id } }), 0);
    } finally {
      await prisma.newsPost.deleteMany({ where: { slug: uiSlug } });
    }
    for (const path of ["pages", "notices", "events", "publications", "administration", "departments", "programs", "courses",
      "gallery", "categories", "dashboard", "contact-messages", "users", "audit-logs", "institution", "media",
      "research-areas", "research-projects", "academic-assets"]) {
      const response = await visit(`/admin/${path}`);
      assert.equal(response.status, 200, path);
      assert.doesNotMatch(await response.text(), /This view could not be loaded/);
    }
    const areaSlug = `ui-research-${randomUUID()}`;
    try {
      await submitAdminForm("/admin/research-areas/new", "title", { slug: areaSlug, title: "Academic UI research area", titleBn: "গবেষণা যাচাই" });
      const area = await prisma.researchArea.findUniqueOrThrow({ where: { slug: areaSlug } });
      await publish(`/admin/research-areas/${area.id}`);
      const en = await (await visit(`/research-areas?search=Academic+UI`)).text();
      assert.match(en, /Academic UI research area/);
      const bn = await (await visit(`/bn/research-areas/${areaSlug}`)).text();
      assert.match(bn, /গবেষণা যাচাই/);
      assert.match(bn, /<html lang="bn"/);
      const download = await visit("/academic-calendar.ics");
      assert.match(download.headers.get("content-type"), /^text\/calendar/);
      assert.match(await download.text(), /^BEGIN:VCALENDAR/);
    } finally {
      await prisma.researchArea.deleteMany({ where: { slug: areaSlug } });
    }
    const imageName = `ui-${randomUUID()}.png`;
    const imageData = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#374151" } }).png().toBuffer();
    try {
      await submitAdminForm("/admin/media", "file", { file: new File([imageData], imageName, { type: "image/png" }), altText: "UI fixture" }, 200);
      const asset = await prisma.mediaAsset.findFirstOrThrow({ where: { filename: imageName } });
      const preview = await visit(`/api/admin/media/${asset.id}?thumb=1`);
      assert.equal(preview.status, 200);
      assert.equal(preview.headers.get("content-type"), "image/webp");
      assert.equal((await api(`/media/files/${asset.id}`)).status, 404);
      const choices = await (await visit(`/api/admin/media?kind=IMAGE&search=${imageName}`)).json();
      assert.equal(choices.data[0].url, asset.url);
    } finally {
      const asset = await prisma.mediaAsset.findFirst({ where: { filename: imageName } });
      if (asset) await api(`/admin/media/${asset.id}`, { method: "DELETE", headers });
    }
    const pageSlug = `phase2-${randomUUID()}`;
    try {
      await submitAdminForm("/admin/pages/new", "title", { title: "Phase 2 public page", slug: pageSlug, content: "Real Pages CMS content", status: "DRAFT" });
      const page = await prisma.page.findUniqueOrThrow({ where: { slug: pageSlug } });
      await publish(`/admin/pages/${page.id}`);
      assert.match(await (await visit(`/pages/${pageSlug}`)).text(), /Real Pages CMS content/);
    } finally {
      await prisma.page.deleteMany({ where: { slug: pageSlug } });
    }
    const signOutCsrf = await (await visit("/api/auth/csrf")).json();
    const logout = await visit("/api/auth/signout", {
      csrfToken: signOutCsrf.csrfToken, callbackUrl: origin + "/admin/login"
    });
    assert.ok([302, 303].includes(logout.status));
    assert.equal(await (await visit("/api/auth/session")).json(), null);
    assert.ok([302, 307].includes((await visit("/admin/dashboard")).status));
    assert.equal((await api("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: process.env.SEED_ADMIN_PASSWORD }) })).status, 429);
  }
});
