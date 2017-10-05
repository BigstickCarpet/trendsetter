'use strict';

// NOTE: Environment variables must be set BEFORE loading the API
require('./environment');

const uuid = require('uuid');
const querystring = require('querystring');
const trendsetterAPI = require('../../api');

module.exports = {
  get: (path) => sendRequest('GET', path),
  post: (path, data) => sendRequest('POST', path, data),
  put: (path, data) => sendRequest('PUT', path, data),
  delete: (path) => sendRequest('DELETE', path),
};

/**
 * Calls the Trensdetter Lambda function the same way that it gets called by AWS API Gateway.
 *
 * @param {string} method - The HTTP method (e.g. "GET")
 * @param {string} path - The URL path (e.g. "/trends")
 * @param {object} [data] - Key/value data to send
 * @returns {Promise<object>} - The promise is fulfilled with the HTTP response object
 */
function sendRequest (method, path, data) {
  return new Promise((resolve, reject) => {
    let event = createEvent(method, path, data);
    let context = createContext(event, resolve, reject);

    trendsetterAPI.handler(event, context, (err, response) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(response);
      }
    });
  });
}

/**
 * Creates an object that mimics the AWS API Gateway "event" parameter
 *
 * @param {string} method - The HTTP method (e.g. "GET")
 * @param {string} path - The URL path (e.g. "/trends")
 * @param {object} [data] - Key/value data to send
 * @returns {object}
 */
function createEvent (method, path, data) {
  return {
    resource: '/{proxy+}',
    path,
    httpMethod: method,
    headers: {
      'CloudFront-Forwarded-Proto': 'https',
      'CloudFront-Is-Desktop-Viewer': 'true',
      'CloudFront-Is-Mobile-Viewer': 'false',
      'CloudFront-Is-SmartTV-Viewer': 'false',
      'CloudFront-Is-Tablet-Viewer': 'false',
      'CloudFront-Viewer-Country': 'US',
      Via: '1.1 example87df087a954630c4cf7b8e364.cloudfront.net (CloudFront)',
      'X-Amz-Cf-Id': 'YarliTso-oW9rCtlsibQeHpoaD9n1uEunP7AFCJullzke1ed-hTeRN==',
      'X-Amzn-Trace-Id': 'Root=1-76d1oq0c-6b3afecf5c1c92373381c220',
      'X-Forwarded-For': '123.123.123.123',
      'X-Forwarded-Port': '443',
      'X-Forwarded-Proto': 'http',
    },
    queryStringParameters: null,
    pathParameters: {
      proxy: path,
    },
    stageVariables: null,
    requestContext: {
      path,
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
        sourceIp: '123.123.123.123',
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'SomeBrowser/1.2.3',
        user: null
      }
    },
    body: querystring.stringify(data),
    isBase64Encoded: false,
  };
}

/**
 * Creates an object that mimics the AWS API Gateway "context" parameter
 *
 * @param {object} event - The mock "event" parameter
 * @param {function} resolve - The callback to call when the Lambda exits successfully
 * @param {function} reject - The callback to call when the Lambda throws an error
 * @returns {object}
 */
function createContext (event, resolve, reject) {
  return {
    callbackWaitsForEmptyEventLoop: false,
    done: (err, result) => err ? reject(err) : resolve(result),
    succeed: resolve,
    fail: reject,
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
}
