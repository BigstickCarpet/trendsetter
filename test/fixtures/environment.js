"use strict";

// If you leave these environment variables blank, then the AWS SDK will automatically
// read your credentials from ~/.aws/credentials
setEnv("AWS_ACCESS_KEY_ID", "");
setEnv("AWS_SECRET_ACCESS_KEY", "");
setEnv("AWS_SESSION_TOKEN", "");

// These environment variables mimic AWS Lambda
setEnv("AWS_REGION", "us-east-1");
setEnv("LAMBDA_TASK_ROOT", process.cwd());
setEnv("LAMBDA_RUNTIME_DIR", process.cwd());

// These environment variables are required by the Trendsetter Lambda function
setEnv("TRENDSETTER_TABLE_NAME", "Trendsetter.Trends");
setEnv("TRENDSETTER_TTL_HOURS", "4");

// Enable "test mode"
setEnv("NODE_ENV", "test");

/**
 * Sets an environment variable, unless it's already set.
 *
 * @param {string} name - The environment variable name
 * @param {string} value - The value to set, unless a value is already set
 */
function setEnv (name, value) {
  if (!process.env[name]) {
    process.env[name] = value;
  }
}


console.log("SUPER_SECRET =", process.env.SUPER_SECRET);
