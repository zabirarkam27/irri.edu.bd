import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role, Status } from "@prisma/client";
import { createSlug } from "../src/utils/slug";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("SEED_ADMIN_PASSWORD is required");

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@irri.edu.com" },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Super Admin",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@irri.edu.com",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  await prisma.institutionProfile.create({
    data: {
      name: "International Rabindra Research Institute",
      nameBn: "আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউট",
      acronym: "IRRI",
      location: "Patisar, Atrai, Naogaon, Rajshahi Division, Bangladesh",
      motto: "To reach excellence through practicing our own history and culture.",
      mottoBn: "নিজস্ব ইতিহাস ও সংস্কৃতি চর্চার মাধ্যমে উৎকর্ষ অর্জন।",
      mission:
        "To promote the thoughts, knowledge, literature, music, philosophy, and cultural legacy of Nobel Laureate Rabindranath Tagore worldwide through research, education, documentation, and academic practice.",
      vision:
        "To build students, researchers, and scholars at Honors, Masters, and PhD levels who can achieve excellence by practicing their own history, culture, literature, and humanistic values.",
      establishedAt: 2014,
      operationStart: 2018,
      domain: "https://www.irri.edu.com"
    }
  });

  const people = [
    ["Sheikh Rezaul Islam", "President / Present Acting Chairman", "MP, Naogaon-6"],
    ["Late Israfil Alam", "Founder Chairman", "Former MP"],
    ["Professor Farhana Akter", "Director General (DG)", "Academic leadership"],
    ["SM Faruq Bokth", "Secretary", "Administration"],
    ["Mr. Hamidur Rahman", "Deputy Director", "Operations"]
  ];

  for (const [name, designation, bio] of people) {
    await prisma.person.upsert({
      where: { slug: createSlug(name) },
      update: {},
      create: { name, slug: createSlug(name), designation, bio, type: "ADMINISTRATION", status: Status.PUBLISHED }
    });
  }

  const pageTitles = ["About", "History", "Mission & Vision", "Administration", "Academic Programs", "Courses", "Research", "Publications", "Gallery", "News", "Notices", "Events", "Contact"];
  for (const title of pageTitles) {
    await prisma.page.upsert({
      where: { slug: createSlug(title) },
      update: {},
      create: {
        title,
        slug: createSlug(title),
        content: `${title} content for International Rabindra Research Institute.`,
        status: Status.PUBLISHED,
        seoTitle: `${title} | International Rabindra Research Institute`,
        metaDescription: `${title} page for International Rabindra Research Institute.`
      }
    });
  }

  const department = await prisma.department.upsert({
    where: { slug: "rabindra-studies" },
    update: {},
    create: {
      name: "Department of Rabindra Studies",
      slug: "rabindra-studies",
      description: "Interdisciplinary research and teaching on Rabindranath Tagore.",
      status: Status.PUBLISHED
    }
  });

  const program = await prisma.program.upsert({
    where: { slug: "ma-in-rabindra-studies" },
    update: {},
    create: {
      title: "MA in Rabindra Studies",
      slug: "ma-in-rabindra-studies",
      level: "Masters",
      duration: "2 years",
      description: "A graduate program focused on Tagore literature, music, philosophy, and cultural studies.",
      status: Status.PUBLISHED,
      departmentId: department.id
    }
  });

  await prisma.course.upsert({
    where: { slug: "tagore-literature-foundations" },
    update: {},
    create: {
      title: "Tagore Literature Foundations",
      slug: "tagore-literature-foundations",
      code: "RBS-501",
      credits: 3,
      description: "Core readings in Tagore's poetry, prose, drama, and essays.",
      status: Status.PUBLISHED,
      programId: program.id,
      departmentId: department.id
    }
  });

  await prisma.category.createMany({
    data: [
      { name: "Academic", slug: "academic", description: "Academic updates" },
      { name: "Research", slug: "research", description: "Research content" },
      { name: "Culture", slug: "culture", description: "Cultural events and programs" }
    ],
    skipDuplicates: true
  });

  await prisma.newsPost.upsert({
    where: { slug: "tagore-research-documentation" },
    update: {},
    create: {
      title: "IRRI announces Tagore research documentation initiative",
      slug: "tagore-research-documentation",
      excerpt: "A new documentation program for Rabindra research materials.",
      content: "IRRI has launched a research documentation initiative for Tagore studies.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.notice.upsert({
    where: { slug: "admission-information-session" },
    update: {},
    create: {
      title: "Admission information session for research programs",
      slug: "admission-information-session",
      content: "Prospective students and researchers are invited to attend the information session.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.event.upsert({
    where: { slug: "rabindra-jayanti-symposium" },
    update: {},
    create: {
      title: "Rabindra Jayanti cultural research symposium",
      slug: "rabindra-jayanti-symposium",
      content: "A symposium connecting cultural practice and academic research.",
      venue: "Patisar Campus",
      startsAt: new Date("2026-05-08T10:00:00+06:00"),
      status: Status.PUBLISHED
    }
  });

  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "irri-campus-and-events" },
    update: {},
    create: {
      title: "IRRI Campus and Events",
      slug: "irri-campus-and-events",
      description: "Selected institute moments.",
      status: Status.PUBLISHED
    }
  });

  await prisma.galleryImage.create({
    data: {
      albumId: album.id,
      url: "/images/gallery/patisar-campus.jpg",
      altText: "IRRI campus at Patisar",
      caption: "Patisar campus"
    }
  });

  await prisma.publication.upsert({
    where: { slug: "journal-of-rabindra-research-volume-1" },
    update: {},
    create: {
      title: "Journal of Rabindra Research, Volume 1",
      slug: "journal-of-rabindra-research-volume-1",
      abstract: "Collected essays and research notes on Rabindranath Tagore.",
      author: "IRRI Editorial Board",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
