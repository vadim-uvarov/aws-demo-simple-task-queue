locals {
  name = var.project
}

resource "aws_dynamodb_table" "tasks" {
  name         = "${local.name}_tasks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "task_id"

  attribute {
    name = "task_id"
    type = "S"
  }
}

resource "aws_sqs_queue" "tasks_dlq" {
  name                      = "${local.name}_tasks-dlq"
  message_retention_seconds = 1209600 # 14 days
}

resource "aws_sqs_queue" "tasks" {
  name                       = "${local.name}_tasks"
  visibility_timeout_seconds = 120
  message_retention_seconds  = 345600 # 4 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.tasks_dlq.arn
    maxReceiveCount     = 3
  })
}
