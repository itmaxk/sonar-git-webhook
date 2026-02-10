import express, { type Request, type Response } from 'express'
import { isProcessableAction, normalizeMrAction } from './actions'
import { processMergeRequest } from './app'
import { config } from './index'
import { logger } from './logger'
import type { GitLabMergeRequestWebhookPayload } from './types'

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.post('/process/:mrId', async (req: Request, res: Response) => {
  const mrId = req.params.mrId
  const projectPath = typeof req.query.projectPath === 'string' && req.query.projectPath.length > 0
    ? req.query.projectPath
    : config.GITLAB_PROJECT

  if (!/^\d+$/.test(mrId)) {
    return res.status(400).json({ success: false, message: 'Invalid MR ID. Must be numeric.' })
  }

  try {
    const result = await processMergeRequest(mrId, projectPath)
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    logger.error('Manual processing failed', { mrId, projectPath, error: String(error) })
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.post('/webhook/gitlab', async (req: Request, res: Response) => {
  const token = req.header('X-Gitlab-Token')
  if (token !== config.WEBHOOK_SECRET) {
    return res.status(401).json({ accepted: false, message: 'Invalid webhook token' })
  }

  const payload = req.body as GitLabMergeRequestWebhookPayload

  if (payload.object_kind !== 'merge_request') {
    return res.status(200).json({
      accepted: true,
      processed: false,
      reason: 'Unsupported object_kind'
    })
  }

  const action = normalizeMrAction(payload.object_attributes?.action)
  const mrIdRaw = payload.object_attributes?.iid
  const projectPath = payload.project?.path_with_namespace || config.GITLAB_PROJECT

  if (!isProcessableAction(action)) {
    return res.status(200).json({
      accepted: true,
      processed: false,
      action,
      reason: 'Action is ignored'
    })
  }

  if (typeof mrIdRaw !== 'number') {
    return res.status(400).json({
      accepted: false,
      processed: false,
      action,
      reason: 'Missing object_attributes.iid'
    })
  }

  const mrId = String(mrIdRaw)

  try {
    const result = await processMergeRequest(mrId, projectPath)

    return res.status(200).json({
      accepted: true,
      processed: true,
      action,
      ...result
    })
  } catch (error) {
    logger.error('Webhook processing failed', {
      mrId,
      action,
      projectPath,
      error: String(error)
    })

    return res.status(500).json({
      accepted: false,
      processed: false,
      action,
      mrId,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.listen(config.PORT, () => {
  logger.info('Webhook service started', { port: config.PORT })
})