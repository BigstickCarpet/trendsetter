#!/usr/bin/env node
/**********************************************************************************
 * This script allows us to test the AWS Lambda function locally without deploying
 * it first.  It sets up an Express web server that calls the Lambda function
 * similarly to how AWS API Gateway calls it.
 **********************************************************************************/
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

// IMPORTANT! Set all environment variables BEFORE loading libraries
const uuid = require('uuid');
const express = require('express');
const trendsetter = require('../lib');

// Start an Express web server to mimic AWS API Gateway
let app = express();
app.use(mockApiGateway);
app.listen(8080, () => console.log('The Trendsetter API is now running at http://localhost:8080'));

/**
 * This function is Express middleware that mimics AWS API Gateway.
 * It calls the Trendsetter API Lambda with mock `event` and `context` objects
 * and handles the Lambda result as appropriate.
 *
 * @param {Request} req - The incoming HTTP request
 * @param {Response} res - The outgoing HTTP response
 */
function mockApiGateway (req, res) {
  let event, context;

  try {
    event = {
      resource: '/{proxy+}',
      path: req.path,
      httpMethod: req.method.toUpperCase(),
      headers: Object.assign({
        'CloudFront-Forwarded-Proto': 'https',
        'CloudFront-Is-Desktop-Viewer': 'true',
        'CloudFront-Is-Mobile-Viewer': 'false',
        'CloudFront-Is-SmartTV-Viewer': 'false',
        'CloudFront-Is-Tablet-Viewer': 'false',
        'CloudFront-Viewer-Country': 'US',
        Via: '1.1 example87df087a954630c4cf7b8e364.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id': 'YarliTso-oW9rCtlsibQeHpoaD9n1uEunP7AFCJullzke1ed-hTeRN==',
        'X-Amzn-Trace-Id': 'Root=1-76d1oq0c-6b3afecf5c1c92373381c220',
        'X-Forwarded-For': req.ip,
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'http',
      }, req.headers),
      queryStringParameters: isEmptyObject(req.query) ? null : req.query,
      pathParameters: {
        proxy: req.path,
      },
      stageVariables: null,
      requestContext: {
        path: req.path,
        accountId: '619784300716',
        resourceId: '36481f',
        stage: 'prod',
        requestId: uuid.v4(),
        identity: {
          cognitoIdentityPoolId: null,
          accountId: null,
          cognitoIdentityId: null,
          caller: null,
          apiKey: '',
          sourceIp: req.ip,
          accessKey: null,
          cognitoAuthenticationType: null,
          cognitoAuthenticationProvider: null,
          userArn: null,
          userAgent: req.get('User-Agent'),
          user: null
        }
      },
      body: req.body,
      isBase64Encoded: false,
    };

    context = {
      callbackWaitsForEmptyEventLoop: false,
      done: sendResponse,
      succeed: (result) => sendResponse(null, result),
      fail: (err) => sendResponse(err),
      logGroupName: '/aws/lambda/TrendsetterLambda',
      logStreamName: '2017/10/04/[$LATEST]example87df087a954630c4cf7b8e364',
      functionName: 'TrendsetterLambda',
      memoryLimitInMB: '128',
      functionVersion: '$LATEST',
      getRemainingTimeInMillis: () => 3000,
      invokeid: event.requestContext.requestId,
      awsRequestId: event.requestContext.requestId,
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:619784300716:function:TrendsetterLambda',
    };

    trendsetter.handler(event, context, sendResponse);
  }
  catch (error) {
    sendResponse(error);
  }

  function sendResponse (err, result) {
    // These headers are always sent
    res.set({
      Via: event.headers.Via,
      'X-Amz-Cf-Id': event.headers['X-Amz-Cf-Id'],
      'x-amzn-RequestId': context.awsRequestId,
    });

    if (err || !isValidResponseObject(result)) {
      console.error(err);
      res
        .set('X-Cache', 'Error from cloudfront')
        .status(502)
        .send({ message: 'Internal server error' });
    }
    else {
      res
        .set(Object.assign({
          'X-Cache': 'Miss from cloudfront',
          'X-Amzn-Trace-Id': 'sampled=0;' + event.headers['X-Amzn-Trace-Id'],
        }, result.headers))
        .status(result.statusCode || 200)
        .send(result.body || '');
    }
  }
}

/**
 * Tests whether the given value is a valid AWS API Gateway response object.
 *
 * @param {*} res - The value to inspect
 * @returns {boolean}
 */
function isValidResponseObject (res) {
  if (!res && typeof res !== 'object') {
    return false;
  }

  // The object is only allowed to have these three keys
  let keys = Object.keys(res);
  removeFromArray(keys, 'statusCode');
  removeFromArray(keys, 'headers');
  removeFromArray(keys, 'body');
  if (keys.length > 0) {
    return false;
  }

  // If statusCode exists, it must be a valid HTTP status code
  if (res.statusCode !== undefined) {
    if (typeof res.statusCode !== 'number' || res.statusCode < 100 || res.statusCode > 599) {
      return false;
    }
  }

  // If the headers exist, it must ben object
  if (res.headers !== undefined) {
    if (res.headers === null || typeof res.headers !== 'object') {
      return false;
    }
  }

  // If the body exists, it must be a string
  if (res.body !== undefined && typeof res.body !== 'string') {
    return false;
  }

  return true;
}

/**
 * Removes the specified value from the given array.
 *
 * @param {Array} array
 * @param {*} value
 */
function removeFromArray (array, value) {
  for (let i = array.length; i >= 0; i--) {
    if (array[i] === value) {
      array.splice(i, 1);
    }
  }
}

/**
 * Determines whether the given value is an empty object
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isEmptyObject (obj) {
  if (obj && typeof obj === 'object' && Object.keys(obj).length > 1) {
    return false;
  }
  else {
    return true;
  }
}
