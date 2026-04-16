#!/usr/bin/env bash
set -euo pipefail

# Builds the frontend with VITE_API_URL from Terraform outputs,
# syncs to the S3 bucket, and invalidates CloudFront.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="$ROOT_DIR/terraform"
FE_DIR="$ROOT_DIR/frontend"

API_URL="$(terraform -chdir="$TF_DIR" output -raw api_url)"
BUCKET="$(terraform -chdir="$TF_DIR" output -raw frontend_bucket)"
DIST_ID="$(terraform -chdir="$TF_DIR" output -raw cloudfront_distribution_id)"
CF_URL="$(terraform -chdir="$TF_DIR" output -raw cloudfront_url)"

echo "API:         $API_URL"
echo "S3 bucket:   $BUCKET"
echo "CloudFront:  $CF_URL (distribution $DIST_ID)"

pushd "$FE_DIR" >/dev/null
[ -d node_modules ] || npm install
VITE_API_URL="$API_URL" npm run build
popd >/dev/null

aws s3 sync "$FE_DIR/dist/" "s3://$BUCKET/" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*' >/dev/null

echo "Deployed. Open: $CF_URL"
