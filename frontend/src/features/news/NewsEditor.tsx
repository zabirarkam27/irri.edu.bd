import { readAdmin } from "@/features/cms/AdminContent";
import type { NewsPost } from "./data";
import { NewsForm } from "./NewsForm";

type DepartmentChoice = { id: string; name: string };

export async function NewsEditor({ post }: { post?: NewsPost }) {
  const first = await readAdmin<DepartmentChoice[]>("/admin/departments?limit=100&sortBy=name&sortOrder=asc");
  const remaining = first ? await Promise.all(Array.from({ length: Math.max(0, (first.meta?.totalPage ?? 1) - 1) },
    (_, i) => readAdmin<DepartmentChoice[]>(`/admin/departments?limit=100&sortBy=name&sortOrder=asc&page=${i + 2}`))) : [];
  return <NewsForm post={post} departments={first && remaining.every(Boolean) ? [first, ...remaining].flatMap((page) => page?.data ?? []) : undefined} />;
}
