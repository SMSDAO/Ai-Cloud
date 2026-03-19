import type { NextFunction, Request, Response } from "express"
import { HttpCode } from "../../common/http"
import { authenticated } from "../http"

/**
 * Supported RBAC roles in ascending privilege order.
 *
 *   user  <  developer  <  admin
 */
export type Role = "user" | "developer" | "admin"

const ROLE_LEVELS: Record<Role, number> = {
  user: 0,
  developer: 1,
  admin: 2,
}

/**
 * Resolve the effective role level for the current request.
 *
 * In the current single-user model any authenticated session is treated as
 * `admin` (level 2). Unauthenticated requests are treated as `user` (level 0).
 */
async function effectiveRoleLevel(req: Request): Promise<number> {
  const isAuthenticated = await authenticated(req)
  return isAuthenticated ? ROLE_LEVELS.admin : ROLE_LEVELS.user
}

/**
 * Return Express middleware that enforces a minimum role level for a route.
 *
 * @param role - Minimum role required to access the route.
 */
export function requireRole(role: Role): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requiredLevel = ROLE_LEVELS[role]
    const callerLevel = await effectiveRoleLevel(req)

    if (callerLevel < requiredLevel) {
      res.status(HttpCode.Forbidden).send("Forbidden")
      return
    }

    next()
  }
}
