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

variable "instance_type" {
  description = "Temporary EC2 instance type"
  type        = string
  default     = "t3.micro"

  validation {
    condition     = var.instance_type == "t3.micro"
    error_message = "This learning environment is restricted to t3.micro."
  }
}