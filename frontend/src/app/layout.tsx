import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
import "@/styles/globals.css";
import { createMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const notoSerifBengali = Noto_Serif_Bengali({ subsets: ["bengali"], weight: ["400", "600"], variable: "--font-bn-serif" });
const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500"], variable: "--font-bn-sans" });

export const metadata: Metadata = createMetadata("International Rabindra Research Institute");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${notoSerifBengali.variable} ${notoSansBengali.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
