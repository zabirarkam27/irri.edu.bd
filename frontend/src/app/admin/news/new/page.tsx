import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { NewsEditor } from "@/features/news/NewsEditor";
export default function Page() {
  return <div className="grid gap-5"><AdminPageHeader title="New news post" description="Draft or publish a news post." /><NewsEditor /></div>;
}
