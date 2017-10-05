#!/usr/bin/env bash
# ====================================================================================
# This script is meant for quickly releasing a new version of the AWS Lambda function.
# It doesn't run any linters or tests beforehand.  It just deploys the latest code and
# bumps the version number in AWS Lambda, package.json, and Git.  It DOES NOT update
# any aliases.
# ====================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

bump --prompt --tag --push --all
