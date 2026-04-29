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
  default     = 5 * 60 # 5 minutes
}
