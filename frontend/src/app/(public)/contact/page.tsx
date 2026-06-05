import { createMetadata } from "@/lib/seo";
import { ContactPage } from "@/features/contact/ContactPage";
export const metadata = createMetadata("Contact");
export default function Page() { return <ContactPage />; }
