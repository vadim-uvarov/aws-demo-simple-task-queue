locals {
  github_repo = "vadim-uvarov/aws-demo-simple-task-queue"
}

data "tls_certificate" "github_oidc" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github_oidc.certificates[0].sha1_fingerprint]
}

data "aws_iam_policy_document" "cicd_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.github_repo}:ref:refs/heads/master"]
    }
  }
}

resource "aws_iam_role" "cicd_deploy" {
  name               = "${local.name}_cicd_deploy"
  assume_role_policy = data.aws_iam_policy_document.cicd_trust.json
}

resource "aws_iam_role_policy_attachment" "cicd_admin" {
  role       = aws_iam_role.cicd_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
