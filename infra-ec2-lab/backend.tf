terraform {
  backend "s3" {
    bucket       = "peter-tofu-s3-state"
    key          = "weather-app/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}