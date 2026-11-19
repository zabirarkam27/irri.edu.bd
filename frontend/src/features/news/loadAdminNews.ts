import { notFound, redirect } from "next/navigation";
import { adminNewsRequest } from "./admin";
import { NewsRequestError, type NewsPost } from "./data";

export async function loadAdminNews(id: string) {
  try {
    return (await adminNewsRequest<NewsPost>(`/${encodeURIComponent(id)}`)).data;
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 404) notFound();
    if (error instanceof NewsRequestError && error.status === 401) redirect("/admin/login");
    throw error;
  }
}
