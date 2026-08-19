variable "aws_region" {
  description = "AWS region for the temporary weather application"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name used to identify the application's AWS resources"
  type        = string
  default     = "weather-app"
}