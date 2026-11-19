import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { LoadFailure, readAdmin } from "@/features/cms/AdminContent";
import { CmsForm } from "@/features/cms/Forms";
import { saveReleaseSettings } from "@/features/cms/actions";
import { releaseSettingsFields, type CmsRecord } from "@/features/cms/config";
import { currentAdmin } from "@/features/news/admin";

function dhakaField(value: unknown) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp + 6 * 60 * 60 * 1000).toISOString() : null;
}

export default async function Page() {
  const account = await currentAdmin().catch(() => null);
  if (!account || !["ADMIN", "SUPER_ADMIN"].includes(account.role)) notFound();

  const result = await readAdmin<CmsRecord | null>("/admin/release-settings");
  const record = result?.data;
  return <div className="grid gap-5">
    <AdminPageHeader title="Release settings" description="" />
    {result ? <CmsForm fields={releaseSettingsFields} record={record ? {
      ...record, releaseStartsAt: dhakaField(record.releaseStartsAt), releaseEndsAt: dhakaField(record.releaseEndsAt)
    } : null} action={saveReleaseSettings} /> : <LoadFailure />}
  </div>;
}
