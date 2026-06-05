import { createMetadata } from "@/lib/seo";
import { PublicPage } from "@/features/public/PublicPage";
export const metadata = createMetadata("Academic Programs");
export default function Page() { return <PublicPage slug="academic-programs" />; }
