# aws-demo-simple-task-queue
A demo web app showing an end-to-end async task pattern on AWS.

## Live Demo
You can try it out yourself [via the web app](https://d34zk8rzmbn1ay.cloudfront.net/).

## Architecture
- **Frontend** (React + TypeScript + Vite) — submit an integer `N`, see the task transition *pending → in progress → completed*, and browse history.
- **API** (Python Lambda behind API Gateway HTTP API) — creates tasks, enqueues them to SQS, lists them from DynamoDB.
- **Worker** (Python Lambda triggered by SQS) — works (actually sleeps) for `N` seconds, measures elapsed time, writes the result back.
- **Infra** (provisioned using Terraform) — DynamoDB, SQS (+DLQ), two Lambdas, API Gateway, S3 + CloudFront for the frontend.

```
browser ──► CloudFront ──► S3 (static bundle)
browser ──► API Gateway ──► api Lambda ──► DynamoDB + SQS
                                             │
                                             ▼
                                         worker Lambda ──► DynamoDB
```

### Layout
```
backend/
  api/handler.py       POST/GET Lambda
  worker/handler.py    SQS consumer
frontend/              Vite + React + TS SPA
terraform/             flat Terraform for all AWS infra
scripts/
  deploy-frontend.sh   build + sync + CloudFront invalidation
```

### API

- `POST /tasks` — body `{"input_seconds": 5}`. Returns the created task.
- `GET /tasks` — list all tasks, newest first.

Validation: `input_seconds` is an integer, `0 ≤ input_seconds` (configurable via `max_seconds` in Terraform).

## Style guide
The code quality is achieved by using **ruff** auto-formatting and **mypy** type-checker. <br> **Commitizen** is used to standartize the commit messages.

## Deploy (CI/CD)
The app (frontend and backend) is deployed automatically via **GitHub Actions** when PR is merged into master. Pushing directly to master is forbidden via branch protection rules.

The backend is deployed via **terraform** and frontend via **npm**-based shell script.

PR is automatically checked for code standards using **GitHub actions** (**ruff** and **mypy**, **terraform fmt**) and the **backend/frontend build** is tested (without deployment). Merging to master is forbidden if until CI pipeline succeeds.

### Local deploy of the frontend
Run `./scripts/deploy-frontend-local.sh`
and then visit http://localhost:5173/

## Manual deploy
### Prerequisites

- Terraform ≥ 1.6
- AWS CLI configured with credentials that can create the listed resources
- Node.js ≥ 18 + npm
- Python 3.12 (for local iteration only — Lambda runtime is provided by AWS)

### Manual deploy

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

### Tear down

```bash
cd terraform
terraform destroy
```

The S3 bucket is created with `force_destroy = true` so `destroy` cleans up the built frontend too.
