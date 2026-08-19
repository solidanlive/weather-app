data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "weather_app" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.weather_app.id]
  iam_instance_profile        = aws_iam_instance_profile.weather_app.name
  associate_public_ip_address = true

  monitoring = false

  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    aws_region   = var.aws_region
    ecr_registry = split("/", aws_ecr_repository.weather_app.repository_url)[0]
    image_uri    = "${aws_ecr_repository.weather_app.repository_url}:latest"
  })

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "disabled"
  }

  credit_specification {
    cpu_credits = "standard"
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project_name}-temporary-instance"
  }
}