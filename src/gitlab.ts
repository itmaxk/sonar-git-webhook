import { config } from './index'
import { fetchWithRetry, gitlabApiUrl } from './http'
import type { GitLabNote } from './types'

const BOT_MARKER = '<!-- sonar-mr-bot -->'

function headers(): Record<string, string> {
  return {
    'PRIVATE-TOKEN': config.GITLAB_TOKEN,
    'Content-Type': 'application/json'
  }
}

function encodedProject(projectPath: string): string {
  return encodeURIComponent(projectPath)
}

function notesUrl(projectPath: string, mrId: string): string {
  return gitlabApiUrl(`/projects/${encodedProject(projectPath)}/merge_requests/${mrId}/notes`)
}

export async function listMergeRequestNotes(projectPath: string, mrId: string): Promise<GitLabNote[]> {
  const response = await fetchWithRetry(notesUrl(projectPath, mrId), {
    method: 'GET',
    headers: headers()
  })

  if (!response.ok) {
    throw new Error(`Failed to list merge request notes: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as GitLabNote[]
}

export async function createMergeRequestNote(projectPath: string, mrId: string, body: string): Promise<GitLabNote> {
  const response = await fetchWithRetry(notesUrl(projectPath, mrId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ body })
  })

  if (!response.ok) {
    throw new Error(`Failed to create merge request note: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as GitLabNote
}

export async function updateMergeRequestNote(
  projectPath: string,
  mrId: string,
  noteId: number,
  body: string
): Promise<GitLabNote> {
  const url = `${notesUrl(projectPath, mrId)}/${noteId}`
  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ body })
  })

  if (!response.ok) {
    throw new Error(`Failed to update merge request note: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as GitLabNote
}

export async function upsertBotComment(
  projectPath: string,
  mrId: string,
  commentBody: string
): Promise<{ mode: 'created' | 'updated'; noteId: number }> {
  const body = `${BOT_MARKER}\n${commentBody}`
  const notes = await listMergeRequestNotes(projectPath, mrId)
  const existing = notes.find((note) => note.body.includes(BOT_MARKER))

  if (existing) {
    const updated = await updateMergeRequestNote(projectPath, mrId, existing.id, body)
    return { mode: 'updated', noteId: updated.id }
  }

  const created = await createMergeRequestNote(projectPath, mrId, body)
  return { mode: 'created', noteId: created.id }
}