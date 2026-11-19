import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicAcademicAsset } from "@/modules/media/references";
import type { ModelName } from "./cms.service";

const edges: Partial<Record<ModelName, Record<string, string>>> = {
  department: { head: "Unit head", people: "People", programs: "Programs", courses: "Courses", researchAreas: "Research areas", researchProjects: "Research projects", publications: "Publications", news: "News" },
  person: { department: "Department", taughtCourses: "Courses", projects: "Research projects", ledProjects: "Projects led", publications: "Publications", headedUnits: "Units headed" },
  program: { department: "Department", courses: "Courses" },
  course: { department: "Department", program: "Program", instructor: "Instructor", prerequisites: "Prerequisites" },
  researchArea: { department: "Department", projects: "Research projects" },
  researchProject: { area: "Research area", department: "Department", lead: "Project lead", team: "Project team", publications: "Publications" },
  publication: { department: "Department", project: "Research project", contributors: "Contributors" },
  academicAsset: { replacement: "Replacement" },
  newsPost: { department: "Department" }
};
const paths: Record<string, string> = {
  Person: "administration", Department: "departments", Program: "academic-programs", Course: "courses",
  ResearchArea: "research-areas", ResearchProject: "research-projects", Publication: "publications",
  NewsPost: "news", AcademicAsset: "academic-assets"
};
const modelKey = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);

export async function academicLinks(model: ModelName, id: string) {
  const groups = edges[model];
  if (!groups) return [];
  const definitions = Prisma.dmmf.datamodel.models;
  const fields = definitions.find(({ name }) => modelKey(name) === model)?.fields ?? [];
  const relations = fields.filter((field) => field.kind === "object" && Object.hasOwn(groups, field.name) && paths[field.type]);
  const select = Object.fromEntries(relations.map((field) => {
    const usesName = ["Person", "Department"].includes(field.type);
    const columns = { id: true, slug: true, status: true, [usesName ? "name" : "title"]: true, [usesName ? "nameBn" : "titleBn"]: true };
    return [field.name, field.isList ? { select: columns, where: { status: "PUBLISHED" }, take: 12, orderBy: { id: "asc" } } : { select: columns }];
  }));
  if (!relations.length) return [];
  const row = await (prisma[model] as any).findUnique({ where: { id }, select });
  const result = [];
  for (const field of relations) {
    const records = (field.isList ? row?.[field.name] ?? [] : [row?.[field.name]]).filter((item: any) => item?.status === "PUBLISHED");
    if (field.type === "AcademicAsset" && records.length && !await prisma.academicAsset.findFirst({
      where: { id: records[0].id, ...publicAcademicAsset() }, select: { id: true }
    })) continue;
    if (records.length) result.push({ label: groups[field.name], path: paths[field.type],
      records: records.map((item: any) => ({ id: item.id, slug: item.slug, title: item.title ?? item.name, titleBn: item.titleBn ?? item.nameBn })) });
  }
  return result;
}
