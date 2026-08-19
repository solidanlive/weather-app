resource "aws_vpc" "weather_app" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.weather_app.id
  cidr_block              = "10.42.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_internet_gateway" "weather_app" {
  vpc_id = aws_vpc.weather_app.id

  tags = {
    Name = "${var.project_name}-internet-gateway"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.weather_app.id

  tags = {
    Name = "${var.project_name}-public-routes"
  }
}

resource "aws_route" "internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.weather_app.id
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "weather_app" {
  name_prefix = "${var.project_name}-"
  description = "Public web access for the temporary weather application"
  vpc_id      = aws_vpc.weather_app.id

  tags = {
    Name = "${var.project_name}-security-group"
  }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.weather_app.id
  description       = "Public HTTP access"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.weather_app.id
  description       = "Public HTTPS access"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.weather_app.id
  description       = "Allow outbound traffic"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}