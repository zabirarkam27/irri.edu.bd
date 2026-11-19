export const institutionPages = ["about", "history", "mission-vision", "research", "admissions"];

export function contentPath(type: string, slug: string) {
  const segment = encodeURIComponent(slug);
  return type === "pages" && institutionPages.includes(slug) ? `/${segment}` : `/${type}/${segment}`;
}
