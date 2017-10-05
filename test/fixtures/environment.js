'use strict';

// If you leave these environment variables blank, then the AWS SDK will automatically
// read your credentials from ~/.aws/credentials
process.env.AWS_ACCESS_KEY_ID = '';
process.env.AWS_SECRET_ACCESS_KEY = '';
process.env.AWS_SESSION_TOKEN = '';

// These environment variables mimic AWS Lambda
process.env.AWS_REGION = 'us-east-1';
process.env.LAMBDA_TASK_ROOT = process.cwd();
process.env.LAMBDA_RUNTIME_DIR = process.cwd();

// These environment variables are required by the Trendsetter Lambda function
process.env.TRENDSETTER_TABLE_NAME = 'Trendsetter.Trends';
process.env.TRENDSETTER_TTL_HOURS = '4';
