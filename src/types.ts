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

export interface GitLabPipelineProject {
  path_with_namespace?: string
}

export interface GitLabPipelineAttributes {
  id?: number
  sha?: string
  status?: string
  source?: string
}

export interface GitLabPipelineWebhookPayload {
  object_kind?: string
  project?: GitLabPipelineProject
  object_attributes?: GitLabPipelineAttributes
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

export interface GitLabMergeRequestRef {
  iid: number
  state?: string
}

export interface ProcessResult {
  mrId: string
  projectPath: string
  sonarUrl: string
  issuesCount: number
  noteMode: 'created' | 'updated'
}
