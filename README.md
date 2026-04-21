# aws-demo-simple-task-queue

A demo web app showing an end-to-end async task pattern on AWS.

- **Frontend** (React + TypeScript + Vite) — submit an integer `N`, see the task transition *pending → in progress → completed*, and browse history.
- **API** (Python Lambda behind API Gateway HTTP API) — creates tasks, enqueues them to SQS, lists them from DynamoDB.
- **Worker** (Python Lambda triggered by SQS) — sleeps `N` seconds, measures elapsed time, writes the result back.
- **Infra** (Terraform, `eu-west-1`) — DynamoDB, SQS (+DLQ), two Lambdas, API Gateway, S3 + CloudFront for the frontend.

```
browser ──► CloudFront ──► S3 (static bundle)
browser ──► API Gateway ──► api Lambda ──► DynamoDB + SQS
                                             │
                                             ▼
                                         worker Lambda ──► DynamoDB
```

## Prerequisites

- Terraform ≥ 1.6
- AWS CLI configured with credentials that can create the listed resources
- Node.js ≥ 18 + npm
- Python 3.12 (for local iteration only — Lambda runtime is provided by AWS)

## Deploy

```bash
# 1. Provision AWS infra
cd terraform
terraform init
terraform apply

# 2. Build and publish the frontend (uses outputs from step 1)
cd ..
./scripts/deploy-frontend.sh
```

Open the `cloudfront_url` output. First CloudFront deploy takes a few minutes to propagate.

## Local frontend against deployed API

```bash
cd frontend
npm install
VITE_API_URL="$(terraform -chdir=../terraform output -raw api_url)" npm run dev
```

## API

- `POST /tasks` — body `{"input_seconds": 5}`. Returns the created task.
- `GET /tasks` — list all tasks, newest first.

Validation: `input_seconds` is an integer, `0 ≤ input_seconds` (configurable via `max_seconds` in Terraform).

## Tear down

```bash
cd terraform
terraform destroy
```

The S3 bucket is created with `force_destroy = true` so `destroy` cleans up the built frontend too.

## Layout

```
backend/
  api/handler.py       POST/GET Lambda
  worker/handler.py    SQS consumer
frontend/              Vite + React + TS SPA
terraform/             flat Terraform for all AWS infra
scripts/
  deploy-frontend.sh   build + sync + CloudFront invalidation
```
