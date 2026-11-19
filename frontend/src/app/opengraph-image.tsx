import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const alt = siteConfig.name;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: 84, color: "#f4fbf8", background: "#10483c" }}>
      <div style={{ fontSize: 32, color: "#f3ce76" }}>{siteConfig.acronym}</div>
      <div style={{ marginTop: 30, maxWidth: 1000, fontSize: 76, fontWeight: 700 }}>{siteConfig.name}</div>
    </div>,
    size
  );
}
