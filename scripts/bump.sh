#!/usr/bin/env bash
# ==================================================================================================
# This script publishes a new version of the AWS Lambda function. It also bumps the version number
# in package.json and Git.
#
# NOTE: This script DOES NOT run any linters or tests beforehand, and it DOES NOT update any
#       AWS Lambda aliases or AWS API Gateway stages.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo
echo Checking your Git working directory...
git update-index -q --ignore-submodules --refresh

if ! git diff-files --quiet --ignore-submodules --
then
    echo You have unstaged changes in your Git working tree
    exit 1
fi

if ! git diff-index --cached --quiet HEAD --ignore-submodules --
then
    eccho You have uncommitted changes in your Git index
    exit 1
fi

echo Packaging the code...
package_file="$(npm run package --silent)"

echo Publishing a new version to AWS Lambda...
json="$(
  aws lambda update-function-code \
    --function-name TrendsetterLambda  \
    --zip-file fileb://${package_file} \
    --publish
)"

# Get the new Lambda version number
version="$(node -p "(${json}).Version")"

echo Bumping the version number in package.json...
version="$(npm version ${version}.0.0)"

echo Pushing v${version} to Git...
git push --quiet
git push --tags --quiet

echo Done!
