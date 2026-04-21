output "api_url" {
  description = "Base URL for the HTTP API."
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "cloudfront_url" {
  description = "Public HTTPS URL of the frontend."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_bucket" {
  description = "S3 bucket hosting the built frontend."
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used for cache invalidation)."
  value       = aws_cloudfront_distribution.frontend.id
}

output "queue_url" {
  description = "SQS queue URL."
  value       = aws_sqs_queue.tasks.url
}

output "table_name" {
  description = "DynamoDB tasks table name."
  value       = aws_dynamodb_table.tasks.name
}
