locals {
  github_actions_subject = join("", [
    "repo:solidanlive@314372960/",
    "weather-app@1339935436:",
    "ref:refs/heads/main"
  ])
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  tags = {
    Name = "${var.project_name}-github-oidc"
  }
}

data "aws_iam_policy_document" "github_actions_trust" {
  statement {
    sid    = "AllowWeatherAppMainBranch"
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity",
    ]

    principals {
      type = "Federated"

      identifiers = [
        aws_iam_openid_connect_provider.github.arn,
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"

      values = [
        "sts.amazonaws.com",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"

      values = [
        local.github_actions_subject,
      ]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name                 = "${var.project_name}-github-deploy"
  description          = "Allows the weather-app main branch to deploy static files"
  assume_role_policy   = data.aws_iam_policy_document.github_actions_trust.json
  max_session_duration = 3600

  tags = {
    Name = "${var.project_name}-github-deploy"
  }
}

data "aws_iam_policy_document" "github_deploy_permissions" {
  statement {
    sid    = "ReadWebsiteBucket"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.website.arn,
    ]
  }

  statement {
    sid    = "ManageWebsiteFiles"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]

    resources = [
      "${aws_s3_bucket.website.arn}/*",
    ]
  }

  statement {
    sid    = "InvalidateWebsiteDistribution"
    effect = "Allow"

    actions = [
      "cloudfront:CreateInvalidation",
    ]

    resources = [
      aws_cloudfront_distribution.website.arn,
    ]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${var.project_name}-website-deployment"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy_permissions.json
}