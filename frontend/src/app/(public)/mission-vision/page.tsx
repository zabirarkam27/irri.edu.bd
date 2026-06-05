import { createMetadata } from "@/lib/seo";
import { PublicPage } from "@/features/public/PublicPage";
export const metadata = createMetadata("Mission & Vision");
export default function Page() { return <PublicPage slug="mission-vision" />; }
