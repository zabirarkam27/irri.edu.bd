import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { NewsForm } from "@/features/news/NewsForm";
export default function Page() {
  return <div className="grid gap-5"><AdminPageHeader title="New news post" description="Draft or publish a news post." /><NewsForm /></div>;
}
