variable "region" {
  description = "AWS region for all resources."
  type        = string
  default     = "eu-west-1"
}

variable "project" {
  description = "Name prefix applied to every resource."
  type        = string
  default     = "task-queue-demo"
}

variable "max_seconds" {
  description = "Upper bound on the user-submitted sleep duration."
  type        = number
  default     = 30
}
