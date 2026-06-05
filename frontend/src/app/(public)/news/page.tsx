import { createMetadata } from "@/lib/seo";
import { PublicPage } from "@/features/public/PublicPage";
export const metadata = createMetadata("News");
export default function Page() { return <PublicPage slug="news" />; }
