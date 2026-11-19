import assert from "node:assert/strict";
import test from "node:test";
import { getPagination, getSort } from "../dist/src/utils/query.js";
import { listQuerySchema } from "../dist/src/modules/cms/cms.validation.js";
import { hasAcademicRights } from "../dist/src/modules/media/references.js";

test("CMS validates list input and caps response sizes", () => {
  assert.equal(listQuerySchema.safeParse({ query: { page: "0" } }).success, false);
  assert.equal(listQuerySchema.safeParse({ query: { limit: "Infinity" } }).success, false);
  const { query } = listQuerySchema.parse({ query: { page: "2", limit: "120", sortBy: "unlisted", sortOrder: "asc" } });
  assert.deepEqual(getPagination(query), { page: 2, limit: 100, skip: 100, take: 100 });
  assert.deepEqual(getSort(query, ["title"]), { createdAt: "asc" });
});

test("public academic release requires attributable evidence valid at release time", () => {
  const now = new Date("2030-05-10T00:00:00Z");
  const approved = { access: "PUBLIC", rightsVerified: true, rightsApprovedBy: "admin",
    rightsApprovedAt: new Date("2030-05-01T00:00:00Z"), rightsStatement: "Public permission",
    rightsEvidence: "Internal reference", expiresAt: new Date("2030-05-11T00:00:00Z") };
  assert.equal(hasAcademicRights(approved, now), true);
  assert.equal(hasAcademicRights({ ...approved, expiresAt: now }, now), false);
  assert.equal(hasAcademicRights({ ...approved, rightsEvidence: null }, now), false);
  assert.equal(hasAcademicRights({ ...approved, rightsApprovedBy: null }, now), false);
  assert.equal(hasAcademicRights({ access: "PRIVATE" }, now), true);
});
