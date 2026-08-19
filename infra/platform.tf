resource "aws_ecr_repository" "weather_app" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-container-repository"
  }
}

resource "aws_ecr_lifecycle_policy" "weather_app" {
  repository = aws_ecr_repository.weather_app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Retain only the three newest images"

        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 3
        }

        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_iam_role" "ec2" {
  name_prefix = "${var.project_name}-ec2-"
  description = "Role used by the temporary weather application instance"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "systems_manager" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "ecr_pull" {
  name = "${var.project_name}-ecr-pull"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid      = "GetECRAuthorizationToken"
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Sid    = "PullWeatherImage"
        Effect = "Allow"

        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]

        Resource = aws_ecr_repository.weather_app.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "weather_app" {
  name_prefix = "${var.project_name}-"
  role        = aws_iam_role.ec2.name

  tags = {
    Name = "${var.project_name}-instance-profile"
  }
}