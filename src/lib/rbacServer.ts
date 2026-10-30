import { NextRequest } from "next/server";
import { UserRole, UserSession, DEMO_USERS, ROLE_PERMISSIONS, PermissionMatrix } from "@/types/rbac";

export function getSessionFromRequest(req: NextRequest): UserSession {
  const roleHeader = req.headers.get("x-user-role") as UserRole | null;
  const role: UserRole = roleHeader && DEMO_USERS[roleHeader] ? roleHeader : "SCRUTINY_OFFICER";
  return DEMO_USERS[role];
}

export function checkPermission(
  req: NextRequest,
  permission: keyof PermissionMatrix
): { allowed: boolean; user: UserSession; error?: string } {
  const user = getSessionFromRequest(req);
  const permissions = ROLE_PERMISSIONS[user.role];

  if (!permissions[permission]) {
    return {
      allowed: false,
      user,
      error: `Access Denied: Role "${user.role}" does not have privilege "${permission}".`,
    };
  }

  return { allowed: true, user };
}

