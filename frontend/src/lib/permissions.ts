export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "MODERATOR";

const permissions: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["content:manage", "media:manage", "messages:view", "audit:view"],
  EDITOR: ["content:write"],
  MODERATOR: ["content:review", "messages:view"]
};

export function can(role: Role, permission: string) {
  return permissions[role].includes("*") || permissions[role].includes(permission);
}
