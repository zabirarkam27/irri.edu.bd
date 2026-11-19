import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

export function generateMetadata() { return publicContentMetadata("pages", "history", "/history"); }
export default function Page() { return <DetailPage type="pages" slug="history" />; }
