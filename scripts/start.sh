#!/usr/bin/env bash
# ====================================================================================
# This script is meant for quickly deploying new code to AWS for during development
# and testing.  It doesn't run any linters or tests beforehand, and it doesn't create
# a new AWS Lambda version or update any aliases.
# ====================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail


#
# This script packages and deploys the new code to S3.  It then updates the
# $LATEST version of AWS Lambda function and deploys it to the "dev" stage of
# AWS API Gateway.
