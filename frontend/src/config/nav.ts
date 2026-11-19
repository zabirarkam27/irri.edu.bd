export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/history", label: "History" },
  { href: "/mission-vision", label: "Mission & Vision" },
  { href: "/administration", label: "Administration" },
  { href: "/academic-programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/departments", label: "Departments" },
  { href: "/courses", label: "Courses" },
  { href: "/research", label: "Research" },
  { href: "/researchers", label: "Researchers" },
  { href: "/research-areas", label: "Research areas" },
  { href: "/research-projects", label: "Research projects" },
  { href: "/academic-assets", label: "Repository and resources" },
  { href: "/academic-calendar", label: "Academic calendar" },
  { href: "/publications", label: "Publications" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/notices", label: "Notices" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" }
];

export const publicNavGroups = [
  { label: "Institute", routes: ["/about", "/history", "/mission-vision", "/administration"] },
  { label: "Academics", routes: ["/academic-programs", "/admissions", "/departments", "/courses", "/academic-calendar"] },
  { label: "Research", routes: ["/research", "/researchers", "/research-areas", "/research-projects", "/publications", "/academic-assets"] },
  { label: "Updates", routes: ["/news", "/notices", "/events", "/gallery"] },
  { label: "Services", routes: ["/contact", "/search"] }
].map((group) => ({
  label: group.label,
  links: group.routes.map((href) => publicNav.find((item) => item.href === href) ?? { href, label: "Search" })
}));

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
  "categories",
  "publications",
  "research-areas",
  "research-projects",
  "academic-assets",
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
