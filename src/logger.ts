import { config } from './index'

const rank: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
}

function canLog(level: keyof typeof rank): boolean {
  return rank[level] >= rank[config.LOG_LEVEL]
}

function safeMeta(meta?: unknown): string {
  if (meta === undefined) {
    return ''
  }
  try {
    return ` ${JSON.stringify(meta)}`
  } catch {
    return ' [unserializable-meta]'
  }
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (canLog('debug')) {
      console.debug(`[debug] ${message}${safeMeta(meta)}`)
    }
  },
  info(message: string, meta?: unknown): void {
    if (canLog('info')) {
      console.info(`[info] ${message}${safeMeta(meta)}`)
    }
  },
  warn(message: string, meta?: unknown): void {
    if (canLog('warn')) {
      console.warn(`[warn] ${message}${safeMeta(meta)}`)
    }
  },
  error(message: string, meta?: unknown): void {
    if (canLog('error')) {
      console.error(`[error] ${message}${safeMeta(meta)}`)
    }
  }
}