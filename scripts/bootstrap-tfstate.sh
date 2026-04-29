#!/usr/bin/env bash
set -euo pipefail

# Creates the S3 bucket and DynamoDB lock table that hold Terraform's remote
# state. Run once per AWS account, before the first `terraform init`. Safe to
# re-run: AWS errors on already-existing resources are ignored.

PROJECT="aws-demo-simple-task-queue"
REGION="eu-west-1"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="${PROJECT}-tfstate-${ACCOUNT_ID}"
LOCK_TABLE="${PROJECT}-tfstate-lock"

echo "Account:    $ACCOUNT_ID"
echo "Region:     $REGION"
echo "Bucket:     $BUCKET"
echo "Lock table: $LOCK_TABLE"

aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" \
  2>&1 | grep -v BucketAlreadyOwnedByYou || true

aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption --bucket "$BUCKET" \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws dynamodb create-table --table-name "$LOCK_TABLE" --region "$REGION" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>&1 | grep -v ResourceInUseException || true

echo "Done. Backend config: bucket=$BUCKET, dynamodb_table=$LOCK_TABLE"
