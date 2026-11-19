import { cache } from "react";
import { newsRequest } from "@/features/news/data";
import { siteConfig } from "@/config/site";

export const loadInstitution = cache(async () => {
  const result = await newsRequest<{
    name: string; nameBn: string | null; location: string; motto: string | null;
    mottoBn: string | null; mission: string; missionBn: string | null; vision: string; visionBn: string | null;
    establishedAt: number | null; operationStart: number | null;
  } | null>("/institution").catch(() => null);
  const profile = result?.data;
  if (!profile) return { name: siteConfig.name, nameBn: siteConfig.nameBn, location: "", motto: "", mottoBn: null, mission: "", missionBn: null, vision: "", visionBn: null, established: "", approved: "" };
  return {
    ...profile,
    nameBn: profile.nameBn ?? "",
    motto: profile.motto ?? "",
    established: profile.establishedAt?.toString() ?? "",
    approved: profile.operationStart?.toString() ?? ""
  };
});
