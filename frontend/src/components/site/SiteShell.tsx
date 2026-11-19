import { Footer } from "@/components/site/Footer";
import { SiteHeader } from "@/components/shared/SiteHeader";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </>
  );
}
