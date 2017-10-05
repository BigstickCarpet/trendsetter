#!/usr/bin/env bash
# ==================================================================================================
# This script does a full release to production.  It runs linters and tests first, then deploys the
# latest code, bumps the version number in AWS Lambda, package.json, and Git, and updates the
# "prod" alias.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo
echo Updating all dependencies...
npm run upgrade --silent

echo Running ESLint...
npm run lint --silent

echo Running tests...
npm test --silent

# Bump the version number in package.json, Git, and AWS Lambda
npm run bump --silent

