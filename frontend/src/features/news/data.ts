import { siteConfig } from "@/config/site";

export const newsStatuses = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] as const;
export type NewsStatus = typeof newsStatuses[number];
export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  titleBn: string | null;
  content: string;
  contentBn: string | null;
  excerpt: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  status: NewsStatus;
  createdAt: string;
  publishedAt: string | null;
};

export async function newsRequest<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${siteConfig.apiBaseUrl}${path}`, { ...options, cache: "no-store" });
  const body = await response.json() as {
    data: T;
    message: string;
    meta?: { page: number; totalPage: number; total: number };
  };
  if (!response.ok) throw new NewsRequestError(response.status, body.message || "News request failed");
  return body;
}

export class NewsRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type SearchParams = Record<string, string | string[] | undefined>;
export function newsQuery(params: SearchParams, admin = false) {
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 200) : "";
  const status = admin && newsStatuses.includes(params.status as NewsStatus) ? String(params.status) : "";
  const page = typeof params.page === "string" && /^[1-9]\d{0,6}$/.test(params.page) ? params.page : "1";
  const sortBy = admin && params.sortBy === "title" ? "title" : admin ? "updatedAt" : "createdAt";
  const sortOrder = sortBy === "title" ? "asc" : "desc";
  const query = new URLSearchParams({ page, sortBy, sortOrder });
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  return query;
}
