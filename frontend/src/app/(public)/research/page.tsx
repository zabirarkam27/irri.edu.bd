import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

export function generateMetadata() { return publicContentMetadata("pages", "research", "/research"); }
export default function Page() { return <DetailPage type="pages" slug="research" />; }
