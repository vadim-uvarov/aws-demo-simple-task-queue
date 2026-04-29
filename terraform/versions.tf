terraform {
  required_version = ">= 1.6"

  backend "s3" {
    bucket       = "aws-demo-simple-task-queue-tfstate-174054318404"
    key          = "terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# CloudFront + ACM resources must live in us-east-1; we don't use a custom cert
# here but keep the aliased provider available for future use.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
