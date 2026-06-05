import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role, Status } from "@prisma/client";
import { createSlug } from "../src/utils/slug";

const prisma = new PrismaClient();

async function upsertInstitution() {
  const existing = await prisma.institutionProfile.findFirst();
  const data = {
    name: "International Rabindra Research Institute",
    nameBn: "আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউট",
    acronym: "IRRI",
    location: "Patisar, Atrai, Naogaon, Rajshahi Division, Bangladesh",
    motto: "To reach excellence through practicing our own history and culture.",
    mottoBn: "নিজস্ব ইতিহাস ও সংস্কৃতি চর্চার মাধ্যমে উৎকর্ষ অর্জন।",
    mission:
      "Promoting Rabindranath Tagore's thoughts, literature, music, philosophy, and cultural legacy through research, education, documentation, and academic practice.",
    missionBn: "রবীন্দ্রচিন্তা, সাহিত্য, সংগীত, দর্শন ও সংস্কৃতির গবেষণা এবং শিক্ষার প্রসার।",
    vision:
      "To build students, researchers, and scholars who pursue excellence through history, culture, literature, and humanistic values.",
    visionBn: "ইতিহাস, সংস্কৃতি, সাহিত্য ও মানবিক মূল্যবোধ চর্চার মাধ্যমে উৎকর্ষমুখী গবেষক গড়ে তোলা।",
    establishedAt: 2014,
    operationStart: 2018,
    domain: "https://irri-edu-bd.vercel.app"
  };

  if (existing) return prisma.institutionProfile.update({ where: { id: existing.id }, data });
  return prisma.institutionProfile.create({ data });
}

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@irri.edu.com" },
    update: { name: process.env.SEED_ADMIN_NAME ?? "Super Admin", role: Role.SUPER_ADMIN, isActive: true },
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Super Admin",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@irri.edu.com",
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true
    }
  });

  await prisma.user.upsert({
    where: { email: "editor@irri.edu.com" },
    update: { name: "Content Editor", role: Role.EDITOR, isActive: true },
    create: {
      name: "Content Editor",
      email: "editor@irri.edu.com",
      passwordHash,
      role: Role.EDITOR,
      isActive: true
    }
  });

  await upsertInstitution();

  const pageTitles = ["About IRRI", "History of IRRI"];
  for (const title of pageTitles) {
    await prisma.page.upsert({
      where: { slug: createSlug(title) },
      update: { status: Status.PUBLISHED },
      create: {
        title,
        titleBn: title === "About IRRI" ? "আইআরআরআই সম্পর্কে" : "আইআরআরআই ইতিহাস",
        slug: createSlug(title),
        excerpt: `${title} overview.`,
        content: `${title} content for International Rabindra Research Institute.`,
        contentBn: "আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউটের নমুনা কনটেন্ট।",
        status: Status.PUBLISHED,
        seoTitle: `${title} | IRRI`,
        metaDescription: `${title} page for International Rabindra Research Institute.`
      }
    });
  }

  const people = [
    ["Sheikh Rezaul Islam", "President / Acting Chairman", "MP, Naogaon-6"],
    ["Professor Farhana Akter", "Director General", "Academic leadership"]
  ];
  for (const [name, designation, bio] of people) {
    await prisma.person.upsert({
      where: { slug: createSlug(name) },
      update: { designation, bio, status: Status.PUBLISHED },
      create: { name, slug: createSlug(name), designation, bio, type: "ADMINISTRATION", status: Status.PUBLISHED }
    });
  }

  const department = await prisma.department.upsert({
    where: { slug: "rabindra-studies" },
    update: { status: Status.PUBLISHED },
    create: {
      name: "Department of Rabindra Studies",
      nameBn: "রবীন্দ্র অধ্যয়ন বিভাগ",
      slug: "rabindra-studies",
      description: "Interdisciplinary research and teaching on Rabindranath Tagore.",
      status: Status.PUBLISHED
    }
  });

  await prisma.department.upsert({
    where: { slug: "bengali-culture" },
    update: { status: Status.PUBLISHED },
    create: {
      name: "Department of Bengali Culture",
      nameBn: "বাংলা সংস্কৃতি বিভাগ",
      slug: "bengali-culture",
      description: "Research on Bengali cultural history and practice.",
      status: Status.PUBLISHED
    }
  });

  const program = await prisma.program.upsert({
    where: { slug: "ma-in-rabindra-studies" },
    update: { status: Status.PUBLISHED, departmentId: department.id },
    create: {
      title: "MA in Rabindra Studies",
      titleBn: "রবীন্দ্র অধ্যয়নে এমএ",
      slug: "ma-in-rabindra-studies",
      level: "Masters",
      duration: "2 years",
      description: "Graduate program focused on Tagore literature, music, philosophy, and cultural studies.",
      status: Status.PUBLISHED,
      departmentId: department.id
    }
  });

  await prisma.program.upsert({
    where: { slug: "certificate-in-tagore-music" },
    update: { status: Status.PUBLISHED, departmentId: department.id },
    create: {
      title: "Certificate in Tagore Music",
      slug: "certificate-in-tagore-music",
      level: "Certificate",
      duration: "6 months",
      description: "Introductory certificate program on Rabindra Sangeet and cultural practice.",
      status: Status.PUBLISHED,
      departmentId: department.id
    }
  });

  await prisma.course.upsert({
    where: { slug: "tagore-literature-foundations" },
    update: { status: Status.PUBLISHED, programId: program.id, departmentId: department.id },
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

  await prisma.course.upsert({
    where: { slug: "rabindra-sangeet-practice" },
    update: { status: Status.PUBLISHED, programId: program.id, departmentId: department.id },
    create: {
      title: "Rabindra Sangeet Practice",
      slug: "rabindra-sangeet-practice",
      code: "RBS-502",
      credits: 2,
      description: "Performance and interpretation practice for Rabindra Sangeet.",
      status: Status.PUBLISHED,
      programId: program.id,
      departmentId: department.id
    }
  });

  await prisma.newsPost.upsert({
    where: { slug: "tagore-research-documentation" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "IRRI announces Tagore research documentation initiative",
      slug: "tagore-research-documentation",
      excerpt: "A new documentation program for Rabindra research materials.",
      content: "IRRI has launched a research documentation initiative for Tagore studies.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.newsPost.upsert({
    where: { slug: "archive-digitization-program" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Archive digitization program begins",
      slug: "archive-digitization-program",
      excerpt: "IRRI begins digitizing archive materials at Patisar campus.",
      content: "The archive digitization program will preserve important cultural documents.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.notice.upsert({
    where: { slug: "admission-information-session" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Admission information session for research programs",
      slug: "admission-information-session",
      content: "Prospective students and researchers are invited to attend the information session.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.notice.upsert({
    where: { slug: "library-access-schedule" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Library access schedule",
      slug: "library-access-schedule",
      content: "Library access is open Sunday to Thursday from 9 AM to 5 PM.",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.event.upsert({
    where: { slug: "rabindra-jayanti-symposium" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Rabindra Jayanti cultural research symposium",
      slug: "rabindra-jayanti-symposium",
      content: "A symposium connecting cultural practice and academic research.",
      venue: "Patisar Campus",
      startsAt: new Date("2026-05-08T10:00:00+06:00"),
      status: Status.PUBLISHED
    }
  });

  await prisma.event.upsert({
    where: { slug: "bengali-literary-archives-workshop" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Bengali literary archives workshop",
      slug: "bengali-literary-archives-workshop",
      content: "Hands-on workshop on preserving and cataloguing literary archives.",
      venue: "IRRI Seminar Hall",
      startsAt: new Date("2026-06-11T10:00:00+06:00"),
      status: Status.PUBLISHED
    }
  });

  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "irri-campus-and-events" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "IRRI Campus and Events",
      slug: "irri-campus-and-events",
      description: "Selected institute moments.",
      status: Status.PUBLISHED
    }
  });

  const imageExists = await prisma.galleryImage.findFirst({ where: { albumId: album.id, url: "/images/gallery/patisar-campus.jpg" } });
  if (!imageExists) {
    await prisma.galleryImage.create({
      data: {
        albumId: album.id,
        url: "/images/gallery/patisar-campus.jpg",
        altText: "IRRI campus at Patisar",
        caption: "Patisar campus"
      }
    });
  }

  const imageTwoExists = await prisma.galleryImage.findFirst({ where: { albumId: album.id, url: "/images/gallery/research-seminar.jpg" } });
  if (!imageTwoExists) {
    await prisma.galleryImage.create({
      data: {
        albumId: album.id,
        url: "/images/gallery/research-seminar.jpg",
        altText: "Research seminar at IRRI",
        caption: "Research seminar"
      }
    });
  }

  await prisma.publication.upsert({
    where: { slug: "journal-of-rabindra-research-volume-1" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Journal of Rabindra Research, Volume 1",
      slug: "journal-of-rabindra-research-volume-1",
      abstract: "Collected essays and research notes on Rabindranath Tagore.",
      author: "IRRI Editorial Board",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.publication.upsert({
    where: { slug: "patisar-cultural-heritage-report" },
    update: { status: Status.PUBLISHED },
    create: {
      title: "Patisar Cultural Heritage Report",
      slug: "patisar-cultural-heritage-report",
      abstract: "A short report on Patisar's cultural heritage and research possibilities.",
      author: "IRRI Research Cell",
      status: Status.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await prisma.category.createMany({
    data: [
      { name: "Academic", slug: "academic", description: "Academic updates" },
      { name: "Research", slug: "research", description: "Research content" }
    ],
    skipDuplicates: true
  });

  const mediaOne = await prisma.mediaAsset.findFirst({ where: { url: "/images/gallery/patisar-campus.jpg" } });
  if (!mediaOne) {
    await prisma.mediaAsset.create({
      data: {
        url: "/images/gallery/patisar-campus.jpg",
        filename: "patisar-campus.jpg",
        mimeType: "image/jpeg",
        size: 245760,
        type: "IMAGE",
        altText: "IRRI campus at Patisar",
        uploadedBy: admin.id
      }
    });
  }

  const mediaTwo = await prisma.mediaAsset.findFirst({ where: { url: "/documents/rabindra-research-note.pdf" } });
  if (!mediaTwo) {
    await prisma.mediaAsset.create({
      data: {
        url: "/documents/rabindra-research-note.pdf",
        filename: "rabindra-research-note.pdf",
        mimeType: "application/pdf",
        size: 512000,
        type: "DOCUMENT",
        altText: "Rabindra research note",
        uploadedBy: admin.id
      }
    });
  }

  const messageExists = await prisma.contactMessage.findFirst({ where: { email: "researcher@example.com", subject: "Research collaboration" } });
  if (!messageExists) {
    await prisma.contactMessage.create({
      data: {
        name: "Visiting Researcher",
        email: "researcher@example.com",
        phone: "+8801700000000",
        subject: "Research collaboration",
        message: "I would like to collaborate with IRRI on Rabindra studies.",
        isRead: false
      }
    });
  }

  const messageTwoExists = await prisma.contactMessage.findFirst({ where: { email: "student@example.com", subject: "Admission inquiry" } });
  if (!messageTwoExists) {
    await prisma.contactMessage.create({
      data: {
        name: "Prospective Student",
        email: "student@example.com",
        subject: "Admission inquiry",
        message: "Please share admission details for the upcoming academic session.",
        isRead: true
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_SAMPLE_DATA",
      entity: "Database",
      entityId: "sample-seed",
      newValue: { source: "prisma/seed-sample.ts" }
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "VERIFY_ADMIN_ACCESS",
      entity: "User",
      entityId: admin.id,
      newValue: { email: admin.email }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Sample data inserted for all tables.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
