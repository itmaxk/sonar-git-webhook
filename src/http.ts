import { config } from './index'

function isRetryableStatus(status: number): boolean {
  return status >= 500
}

function isRetryableError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1,
  timeoutMs = 15000
): Promise<Response> {
  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (response.ok) {
        return response
      }

      if (attempt < retries && isRetryableStatus(response.status)) {
        attempt += 1
        continue
      }

      return response
    } catch (error) {
      clearTimeout(timeout)
      lastError = error

      if (attempt < retries && isRetryableError(error)) {
        attempt += 1
        continue
      }

      throw error
    }
  }

  throw lastError ?? new Error('Request failed')
}

export function gitlabApiUrl(path: string): string {
  return `${config.GITLAB_URL}/api/v4${path}`
}