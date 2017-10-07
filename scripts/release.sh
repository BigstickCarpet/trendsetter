#!/usr/bin/env bash
# ==================================================================================================
# This script does a full release of the Trendsetter API and website to production.
# It runs lintersand tests first, then deploys the latest code, bumps the version number in
# AWS Lambda, package.json, and Git, and updates the "Prod" alias.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Make sure the Git working directory is clean
./scripts/ensure-clean-git.sh

echo
echo Updating all dependencies...
npm run upgrade --silent

echo
echo Committing updated dependencies...
git commit --all -m "Updated dependencies"

echo
echo Running ESLint...
npm run lint --silent

echo
echo Committing ESLint audo-fixes...
git commit --all -m "ESLint auto-fixes"

echo
echo Running tests...
npm test --silent

# Bump the version number in package.json, Git, and AWS Lambda
npm run bump --silent

# Get the new version number from package.json
lambda_version=$(node -p "parseInt(require('./package.json').version)")

echo
echo Aliasing v${lambda_version} as Prod...
json="$(
  aws lambda update-alias \
    --function-name TrendsetterLambda \
    --function-version ${lambda_version} \
    --name Prod
)"

# echo
# echo "${json}"

echo
echo All Done!
