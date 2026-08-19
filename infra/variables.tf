variable "aws_region" {
  description = "AWS region used for the static website resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name used when labeling resources"
  type        = string
  default     = "weather-app"
}