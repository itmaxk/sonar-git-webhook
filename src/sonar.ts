import { config } from './index'
import { fetchWithRetry } from './http'
import type { SonarIssue, SonarIssuesResponse } from './types'

const severityOrder = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

export function buildSonarDashboardUrl(mrId: string): string {
  const url = new URL(`${config.SONAR_URL}/component_measures`)
  url.searchParams.set('id', config.SONAR_PROJECT)
  url.searchParams.set('pullRequest', mrId)
  url.searchParams.set('issueStatuses', 'OPEN')
  return url.toString()
}

function buildSonarApiUrl(mrId: string): string {
  const url = new URL(`${config.SONAR_URL}/api/issues/search`)
  url.searchParams.set('components', config.SONAR_PROJECT)
  url.searchParams.set('pullRequest', mrId)
  url.searchParams.set('issueStatuses', 'OPEN')
  url.searchParams.set('ps', '100')
  return url.toString()
}

export async function fetchSonarIssues(mrId: string): Promise<SonarIssuesResponse> {
  const response = await fetchWithRetry(buildSonarApiUrl(mrId), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.SONAR_TOKEN}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch SonarQube issues: ${response.status} ${response.statusText}`)
  }

  const raw = (await response.json()) as { issues?: SonarIssue[]; total?: number }
  return {
    issues: raw.issues ?? [],
    total: raw.total ?? 0
  }
}

export function formatSonarIssues(issues: SonarIssue[], total: number): string {
  if (issues.length === 0) {
    return 'No issues found.'
  }

  const sorted = [...issues].sort((a, b) => {
    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  })

  const separator = '----------------------------------------'
  let out = `Total Issues: ${total}\n\n`

  for (const severity of severityOrder) {
    const bucket = sorted.filter((issue) => issue.severity === severity)
    if (bucket.length === 0) continue

    out += `${separator}\n`
    out += `${severity} (${bucket.length} issues)\n`
    out += `${separator}\n`

    for (const [index, issue] of bucket.entries()) {
      const location = issue.line ? `${issue.component}:${issue.line}` : issue.component
      const num = String(index + 1).padStart(2, '0')
      out += `${num}. - ${location}\n`
      out += `    Message: ${issue.message}\n`
      out += `    Status: ${issue.status}\n`
    }

    out += '\n'
  }

  return out.trim()
}
