import { z } from 'zod'

function unquote(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

const stringFromEnv = z.preprocess(
  (value) => (typeof value === 'string' ? unquote(value) : value),
  z.string().min(1)
)

const envSchema = z.object({
  GITLAB_TOKEN: stringFromEnv,
  GITLAB_URL: stringFromEnv.pipe(z.string().url()),
  GITLAB_PROJECT: stringFromEnv,
  SONAR_TOKEN: stringFromEnv,
  SONAR_URL: stringFromEnv.pipe(z.string().url()),
  SONAR_PROJECT: stringFromEnv,
  WEBHOOK_SECRET: stringFromEnv,
  PORT: z.preprocess(
    (value) => {
      if (value === undefined) return 3004
      if (typeof value === 'string') return Number(unquote(value))
      return value
    },
    z.number().int().positive()
  ),
  LOG_LEVEL: z.preprocess(
    (value) => (typeof value === 'string' ? unquote(value) : value),
    z.enum(['debug', 'info', 'warn', 'error'])
  )
})

export type EnvConfig = z.infer<typeof envSchema>

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function loadConfig(): EnvConfig {
  const parsed = envSchema.parse(process.env)

  return {
    ...parsed,
    GITLAB_URL: trimTrailingSlash(parsed.GITLAB_URL),
    SONAR_URL: trimTrailingSlash(parsed.SONAR_URL)
  }
}
