export type Field = {
  name: string;
  label: string;
  kind?: "text" | "area" | "date" | "number" | "url" | "enum" | "relation";
  required?: boolean;
  options?: string[];
  resource?: string;
  initial?: string;
};

const field = (name: string, label: string, extras: Omit<Field, "name" | "label"> = {}): Field => ({ name, label, ...extras });
const title = [field("title", "Title", { required: true }), field("titleBn", "Bengali title")];
const name = [field("name", "Name", { required: true }), field("nameBn", "Bengali name")];
const slug = field("slug", "Slug");
const status = field("status", "Status", { kind: "enum", options: ["DRAFT", "PUBLISHED", "ARCHIVED"], initial: "DRAFT" });
const content = [field("content", "Content", { kind: "area", required: true }), field("contentBn", "Bengali content", { kind: "area" })];
const description = field("description", "Description", { kind: "area" });
const excerpt = field("excerpt", "Excerpt", { kind: "area" });
const seo = [field("seoTitle", "SEO title"), field("metaDescription", "Meta description", { kind: "area" })];
const publishedAt = field("publishedAt", "Publication date and time (UTC)", { kind: "date" });
const department = field("departmentId", "Department", { kind: "relation", resource: "departments" });
const program = field("programId", "Program", { kind: "relation", resource: "programs" });

export const resources: Record<string, { label: string; api: string; fields: Field[] }> = {
  pages: { label: "Pages", api: "pages", fields: [...title, slug, ...content, excerpt, ...seo, field("ogImage", "Social image URL", { kind: "url" }), status] },
  notices: { label: "Notices", api: "notices", fields: [...title, slug, ...content, publishedAt, ...seo, status] },
  events: { label: "Events", api: "events", fields: [...title, slug, ...content, field("venue", "Venue"), field("startsAt", "Starts (UTC)", { kind: "date", required: true }), field("endsAt", "Ends (UTC)", { kind: "date" }), ...seo, status] },
  publications: { label: "Publications", api: "publications", fields: [...title, slug, field("author", "Author"), field("abstract", "Abstract", { kind: "area" }), field("fileUrl", "Document URL", { kind: "url" }), publishedAt, ...seo, status] },
  administration: { label: "People", api: "people", fields: [...name, slug, field("designation", "Designation", { required: true }), field("bio", "Biography", { kind: "area" }), field("photoUrl", "Photo URL", { kind: "url" }), field("order", "Display order", { kind: "number", initial: "0" }), field("type", "Profile type", { kind: "enum", options: ["ADMINISTRATION", "FACULTY", "STAFF", "RESEARCHER"], initial: "ADMINISTRATION" }), status] },
  departments: { label: "Departments", api: "departments", fields: [...name, slug, description, status] },
  programs: { label: "Programs", api: "programs", fields: [...title, slug, field("level", "Level", { required: true }), field("duration", "Duration"), description, department, status] },
  courses: { label: "Courses", api: "courses", fields: [...title, slug, field("code", "Course code"), field("credits", "Credits", { kind: "number" }), description, department, program, status] },
  gallery: { label: "Gallery albums", api: "gallery-albums", fields: [...title, slug, description, status] },
  categories: { label: "Categories", api: "categories", fields: [name[0], slug, description] }
};

export const institutionFields = [
  ...name, field("acronym", "Acronym", { required: true }), field("location", "Location", { required: true }),
  field("domain", "Website URL", { kind: "url", required: true }),
  field("mission", "Mission", { kind: "area", required: true }), field("missionBn", "Bengali mission", { kind: "area" }),
  field("vision", "Vision", { kind: "area", required: true }), field("visionBn", "Bengali vision", { kind: "area" }),
  field("motto", "Motto"), field("mottoBn", "Bengali motto"),
  field("establishedAt", "Established year", { kind: "number" }), field("operationStart", "Operations start year", { kind: "number" })
];

export type CmsRecord = Record<string, unknown> & { id: string };
export type SearchParams = Record<string, string | string[] | undefined>;
export function formValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
