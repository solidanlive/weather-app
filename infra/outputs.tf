output "bucket_name" {
  description = "Name of the private S3 website bucket"
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution identifier"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront-generated domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "HTTPS URL for the weather application"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}