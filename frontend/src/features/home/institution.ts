import { cache } from "react";
import { newsRequest } from "@/features/news/data";
import { institution } from "./data";

export const loadInstitution = cache(async () => {
  const result = await newsRequest<{
    name: string; nameBn: string | null; location: string; motto: string | null;
    mission: string; vision: string; establishedAt: number | null; operationStart: number | null;
  } | null>("/institution").catch(() => null);
  const profile = result?.data;
  if (!profile) return institution;
  return {
    ...profile,
    nameBn: profile.nameBn ?? "",
    motto: profile.motto ?? "",
    established: profile.establishedAt?.toString() ?? "",
    approved: profile.operationStart?.toString() ?? ""
  };
});
