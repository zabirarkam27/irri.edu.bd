import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

export function generateMetadata() { return publicContentMetadata("pages", "mission-vision", "/mission-vision"); }
export default function Page() { return <DetailPage type="pages" slug="mission-vision" />; }
