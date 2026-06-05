export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/history", label: "History" },
  { href: "/mission-vision", label: "Mission & Vision" },
  { href: "/administration", label: "Administration" },
  { href: "/academic-programs", label: "Programs" },
  { href: "/courses", label: "Courses" },
  { href: "/research", label: "Research" },
  { href: "/publications", label: "Publications" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/notices", label: "Notices" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" }
];

export const adminNav = [
  "dashboard",
  "profile",
  "institution",
  "pages",
  "administration",
  "departments",
  "programs",
  "courses",
  "news",
  "notices",
  "events",
  "gallery",
  "publications",
  "media",
  "contact-messages",
  "audit-logs",
  "users",
  "settings"
].map((item) => ({
  href: `/admin/${item}`,
  label: item
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ")
}));
