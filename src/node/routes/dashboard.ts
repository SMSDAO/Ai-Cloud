import type { Request, Response, NextFunction } from "express"
import { Router } from "express"
import { promises as fs } from "fs"
import { RateLimiter } from "limiter"
import * as path from "path"
import { rootPath } from "../constants"
import { ensureAuthenticated, replaceTemplates } from "../http"

/**
 * Serve an enterprise dashboard page, replacing template variables.
 */
const servePage = async (req: Request, file: string): Promise<string> => {
  const content = await fs.readFile(path.join(rootPath, "src/browser/pages", file), "utf8")
  return replaceTemplates(req, content)
}

// Rate-limit dashboard access: 30 requests per minute per process.
const dashboardLimiter = new RateLimiter({ tokensPerInterval: 30, interval: "minute" })

/**
 * Rate-limiting middleware for dashboard routes.
 * Must be registered before the authentication middleware.
 */
const rateLimit = (_req: Request, res: Response, next: NextFunction): void => {
  if (!dashboardLimiter.tryRemoveTokens(1)) {
    res.status(429).send("Too Many Requests")
    return
  }
  next()
}

export const router = Router()

// Apply rate limiting first, then enforce authentication on all dashboard routes.
router.use(rateLimit)
router.use(async (req, res, next) => {
  try {
    await ensureAuthenticated(req, res, next)
  } catch (error) {
    next(error)
  }
})

/** User dashboard */
router.get("/", async (req, res) => {
  res.send(await servePage(req, "dashboard.html"))
})

/** User management (Admin view) */
router.get("/users", async (req, res) => {
  res.send(await servePage(req, "admin.html"))
})

/** Admin dashboard */
router.get("/admin", async (req, res) => {
  res.send(await servePage(req, "admin.html"))
})

/** Developer dashboard */
router.get("/developer", async (req, res) => {
  res.send(await servePage(req, "developer.html"))
})

/** Settings — redirect to main dashboard for now */
router.get("/settings", async (req, res) => {
  res.send(await servePage(req, "dashboard.html"))
})
