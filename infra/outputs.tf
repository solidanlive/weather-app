output "deployment_region" {
  description = "AWS region selected for the application"
  value       = var.aws_region
}

output "availability_zone" {
  description = "First available Availability Zone in the selected region"
  value       = data.aws_availability_zones.available.names[0]
}

output "vpc_id" {
  description = "ID of the weather application VPC"
  value       = aws_vpc.weather_app.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.weather_app.id
}

output "ecr_repository_url" {
  description = "Repository URL for the weather application container"
  value       = aws_ecr_repository.weather_app.repository_url
}

output "instance_profile_name" {
  description = "IAM instance profile for the temporary EC2 instance"
  value       = aws_iam_instance_profile.weather_app.name
}