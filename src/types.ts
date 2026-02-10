export interface GitLabWebhookProject {
  path_with_namespace?: string
}

export interface GitLabWebhookAttributes {
  iid?: number
  action?: string
}

export interface GitLabMergeRequestWebhookPayload {
  object_kind?: string
  project?: GitLabWebhookProject
  object_attributes?: GitLabWebhookAttributes
}

export interface SonarIssue {
  key: string
  rule: string
  severity: string
  component: string
  line?: number
  message: string
  status: string
}

export interface SonarIssuesResponse {
  issues: SonarIssue[]
  total: number
}

export interface GitLabNote {
  id: number
  body: string
}

export interface ProcessResult {
  mrId: string
  projectPath: string
  sonarUrl: string
  issuesCount: number
  noteMode: 'created' | 'updated'
}