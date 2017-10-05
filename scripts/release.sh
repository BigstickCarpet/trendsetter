#!/usr/bin/env bash
# ==================================================================================================
# This script does a full release to production.  It runs linters and tests first, then deploys the
# latest code, bumps the version number in AWS Lambda, package.json, and Git, and updates the
# "Prod" alias.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo
echo Updating all dependencies...
npm run upgrade --silent

echo
echo Running ESLint...
npm run lint --silent

echo
echo Running tests...
npm test --silent

# Bump the version number in package.json, Git, and AWS Lambda
npm run bump --silent

# Get the new version number from package.json
version=$(node -p "parseInt(require('./package.json').version)")

echo
echo Aliasing v${version} as Prod...
json="$(
  aws lambda update-alias \
    --function-name TrendsetterLambda \
    --function-version ${version} \
    --name Prod
)"

# echo
# echo "${json}"

echo
echo All Done!
