import { logger } from "@coder/logger"
import { z } from "zod"

const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a numeric string")
    .transform(Number)
    .refine((n) => n > 0 && n <= 65535, "PORT must be between 1 and 65535")
    .optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  PASSWORD: z.string().min(8, "PASSWORD must be at least 8 characters").optional(),
})

/**
 * Validate required environment variables on startup.
 * Calls process.exit(1) if validation fails (fail-fast).
 */
export function validateEnv(): void {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    for (const issue of result.error.issues) {
      logger.error(`Environment variable ${issue.path.join(".")}: ${issue.message}`)
    }
    process.exit(1)
  }
}
