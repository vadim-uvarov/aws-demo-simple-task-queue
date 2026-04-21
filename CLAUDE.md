# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Demo of an async task pattern on AWS. User submits an integer `N`, a Python Lambda sleeps `N` seconds, UI polls for status. Stack: Terraform (eu-west-1), Python Lambdas, API Gateway HTTP API, SQS, DynamoDB, S3 + CloudFront for the SPA.

## Commands

Infra (from `terraform/`):

```bash
terraform init
terraform apply                                  # provision everything
terraform output -raw api_url                    # HTTP API base URL
terraform output -raw cloudfront_url             # deployed frontend URL
terraform destroy                                # tears down (bucket has force_destroy)
```

Frontend (from `frontend/`):

```bash
npm install
VITE_API_URL="$(terraform -chdir=../terraform output -raw api_url)" npm run dev
npm run build                                    # tsc -b && vite build
```

Full frontend publish (build + S3 sync + CloudFront invalidation, reads TF outputs):

```bash
./scripts/deploy-frontend.sh
```

Smoke test the API directly:

```bash
API_URL="$(terraform -chdir=terraform output -raw api_url)"
curl -X POST "$API_URL/tasks" -H 'content-type: application/json' -d '{"seconds":3}'
curl "$API_URL/tasks"
```

## Conventions

- All AWS resources are named `${var.project}_...`.
- Timestamps are ISO-8601 UTC with milliseconds and a trailing `Z`, produced by `_now_iso()` in both handlers.
- Task ids are UUIDv4 strings.
- Status values are exactly `pending` | `in_progress` | `completed` — the frontend's CSS badge classes (`badge-pending`, `badge-in_progress`, `badge-completed`) match these literally.

## Coding Standards

### Commits
- use commitizen format for commit messages

### Function Naming
- Start all function and method names with action verbs.
- Prefer full variable names for readability (e.g., `response` instead of `resp`)
- Separate code from the inline comment with two spaces