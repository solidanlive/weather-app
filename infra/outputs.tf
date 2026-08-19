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