variable "region" {
  description = "AWS region for all resources."
  type        = string
  default     = "eu-west-1"
}

variable "project" {
  description = "Name prefix applied to every resource."
  type        = string
  default     = "aws-demo-simple-task-queue"
}

variable "max_seconds" {
  description = "Upper bound on the user-submitted sleep duration."
  type        = number
  default     = 30
}

variable "max_queue_size" {
  description = "Maximum number of pending tasks allowed in the SQS queue before new submissions are rejected."
  type        = number
  default     = 5
}
