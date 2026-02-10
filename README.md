# Sonar GitLab Webhook Service

Service receives GitLab merge request webhooks, fetches SonarQube issues by MR ID, and upserts a comment in the target merge request.

## Environment

Use `.env` (copy from `.env.example`).
For Docker `--env-file`, use values **without quotes**.

Required variables:

- `GITLAB_TOKEN`
- `GITLAB_URL`
- `GITLAB_PROJECT` (full path, for example `gitlab-project/implementation`)
- `SONAR_TOKEN`
- `SONAR_URL`
- `SONAR_PROJECT`
- `WEBHOOK_SECRET`
- `PORT` (default `3004`)
- `LOG_LEVEL` (`debug|info|warn|error`)
- `CONTAINER_NAME` (default `sonar-git-webhook`)

### Generate `WEBHOOK_SECRET`

PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

OpenSSL:

```bash
openssl rand -base64 32
```

Then put the generated value in `.env`:

```env
WEBHOOK_SECRET=your-generated-secret
```

## Run locally

```bash
npm install
npm run dev
```

Endpoints:

- `GET /health`
- `POST /process/:mrId`
- `POST /webhook/gitlab`

## GitLab webhook setup

Set webhook URL to:

`http://<host>:3004/webhook/gitlab`

Set secret token in GitLab webhook settings and same value in `.env` as `WEBHOOK_SECRET`.

Enable merge request events.

Processed actions: `opened`, `reopened`, `updated`.

## Postman testing

### 1) Manual endpoint (`/process/:mrId`)

- Method: `POST`
- URL: `http://localhost:3004/process/13552`
- Headers: none
- Body: empty

Expected result:
- HTTP `200`
- JSON contains `success: true`, `issuesCount`, `noteMode`
- GitLab MR gets a new or updated bot comment

### 2) Webhook endpoint (`/webhook/gitlab`)

- Method: `POST`
- URL: `http://localhost:3004/webhook/gitlab`
- Headers:
  - `Content-Type: application/json`
  - `X-Gitlab-Token: <WEBHOOK_SECRET>`
- Body (`raw`, JSON):

```json
{
  "object_kind": "merge_request",
  "project": {
    "path_with_namespace": "gitlab-project/implementation"
  },
  "object_attributes": {
    "iid": 13552,
    "action": "opened"
  }
}
```

Expected result:
- HTTP `200`
- JSON contains `accepted: true` and `processed: true`

### Negative checks

- Wrong `X-Gitlab-Token` -> HTTP `401`
- `action: "closed"` -> HTTP `200` with `processed: false`
- Invalid MR ID for `/process/:mrId` (for example `/process/abc`) -> HTTP `400`

## Docker

Build:

```bash
docker build -t sonar-git-webhook .
```

Run:

```bash
docker run --rm -p 3004:3004 --env-file .env sonar-git-webhook
```

Run with custom container name from `.env`:

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down
```