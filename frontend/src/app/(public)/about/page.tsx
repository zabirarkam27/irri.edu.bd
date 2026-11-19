import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

export function generateMetadata() { return publicContentMetadata("pages", "about", "/about"); }
export default function Page() { return <DetailPage type="pages" slug="about" />; }
