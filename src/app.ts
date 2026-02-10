import { buildGitLabComment } from './format'
import { upsertBotComment } from './gitlab'
import { logger } from './logger'
import { buildSonarDashboardUrl, fetchSonarIssues, formatSonarIssues } from './sonar'
import type { ProcessResult } from './types'

export async function processMergeRequest(mrId: string, projectPath: string): Promise<ProcessResult> {
  if (!/^\d+$/.test(mrId)) {
    throw new Error('Invalid MR ID. Must be numeric.')
  }

  if (!projectPath || projectPath.trim().length === 0) {
    throw new Error('Invalid project path.')
  }

  logger.info('Processing merge request', { mrId, projectPath })

  const sonarUrl = buildSonarDashboardUrl(mrId)
  const sonar = await fetchSonarIssues(mrId)
  const issuesText = formatSonarIssues(sonar.issues, sonar.total)
  const commentBody = buildGitLabComment(sonarUrl, issuesText)
  const upsert = await upsertBotComment(projectPath, mrId, commentBody)

  logger.info('Merge request processed', {
    mrId,
    projectPath,
    issuesCount: sonar.total,
    noteMode: upsert.mode,
    noteId: upsert.noteId
  })

  return {
    mrId,
    projectPath,
    sonarUrl,
    issuesCount: sonar.total,
    noteMode: upsert.mode
  }
}