output "deployment_region" {
  description = "AWS region selected for the application"
  value       = var.aws_region
}

output "availability_zone" {
  description = "First available Availability Zone in the selected region"
  value       = data.aws_availability_zones.available.names[0]
}