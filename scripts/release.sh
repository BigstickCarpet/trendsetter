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

# echo
# echo Running ESLint...
# npm run lint --silent

echo
echo Running tests...
npm test --silent

# Bump the version number in package.json, Git, and AWS Lambda
npm run bump --silent

echo
echo Aliasing v${lambda_version} as "Prod"...
json="$(
  aws lambda update-alias \
    --function-name TrendsetterLambda \
    --name Prod
    --function-version ${lambda_version} \
)"

echo
echo Done!

echo
echo "${json}"
# aws lambda add-permission --function-name arn:aws:lambda:us-east-1:600218629851:function:TrendsetterLambda:Dev --source-arn 'arn:aws:execute-api:us-east-1:600218629851:w0lhb0c796/*/*/' --principal apigateway.amazonaws.com --statement-id 1a3e76c0-6e74-4eb1-864d-3d2620929f35 --action lambda:InvokeFunction
# aws lambda add-permission --function-name arn:aws:lambda:us-east-1:600218629851:function:TrendsetterLambda:Dev --source-arn 'arn:aws:execute-api:us-east-1:600218629851:w0lhb0c796/*/*/*' --principal apigateway.amazonaws.com --statement-id 68c04ed5-e856-48d3-91d9-c326efdae490 --action lambda:InvokeFunction
