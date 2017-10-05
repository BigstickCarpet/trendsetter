#!/usr/bin/env bash
# ==================================================================================================
# This script does the initial creation and setup of all AWS resources for the Trendsetter API.
# This includes creation of the S3 buckets, Lambda function, API Gateway, stages, etc.
#
# NOTE: This script is intended to be run on an empty AWS environment. It will fail if any of the
#       objects already exist
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

