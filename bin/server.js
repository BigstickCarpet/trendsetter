#!/usr/bin/env node
'use strict';

// NOTE: These environment variables must be set BEFORE importing modules
process.env.AWS_REGION = 'us-east-1';
process.env.TRENDSETTER_TABLE_NAME = 'Trendsetter.Trends';

const _ = require('lodash');
const uuid = require('uuid');
const cors = require('cors');
const express = require('express');
const querystring = require('querystring');
const trendsetter = require('../lib');
const sampleRequest = require('../lib/sampleRequest.json');
const sampleContext = require('../lib/sampleContext.json');

// Serve the Trendsetter website on port 7070
let website = express();
website.use(express.static('./docs'));
website.listen(7070, () => console.log('The Trendsetter website is now running at http://localhost:7070'));

// Serve the Trendsetter API on port 8080
let api = express();
api.use(cors());
api.use(mockApiGateway);
api.listen(8080, () => console.log('The Trendsetter API is now running at http://localhost:8080'));

/**
 * This function is Express middleware that mimics AWS API Gateway.
 * It calls the Trendsetter API Lambda with mock `event` and `context` objects
 * and handles the Lambda result as appropriate.
 *
 * @param {http.IncomingRequest} req - The incoming HTTP request
 * @param {http.ServerResponse} res - The outgoing HTTP response
 */
function mockApiGateway (req, res) {
  let apiGatewayRequest = createRequest(req);
  let apiGatewayContext = createContext(apiGatewayRequest);

  try {
    trendsetter.handler(apiGatewayRequest, apiGatewayContext, sendResponse);
  }
  catch (error) {
    sendResponse(error);
  }

  /**
   * Responds to the HTTP request as AWS API Gateway would
   *
   * @param {?Error} error - The error that occurred, if any
   * @param {?object} [apiGatewayResponse] - The AWS API Gateway response object
   */
  function sendResponse (error, apiGatewayResponse) {
    // API Gateway always sets these headers, regardless of success or error
    res.set({
      Via: apiGatewayRequest.headers.Via,
      'X-Amz-Cf-Id': apiGatewayRequest.headers['X-Amz-Cf-Id'],
      'x-amzn-RequestId': apiGatewayContext.awsRequestId,
    });

    if (error) {
      console.error(error);
      res
        .set('X-Cache', 'Error from cloudfront')
        .status(502)
        .send({ message: 'Internal server error' });
    }
    else {
      res
        .set(Object.assign({
          'X-Cache': 'Miss from cloudfront',
          'X-Amzn-Trace-Id': 'sampled=0;' + apiGatewayRequest.headers['X-Amzn-Trace-Id'],
        }, apiGatewayResponse.headers))
        .status(apiGatewayResponse.statusCode || 200)
        .send(apiGatewayResponse.body || '');
    }
  }
}

/**
 * Creates an AWS API Gateway request object from an Express request object.
 *
 * @param {http.IncomingRequest} httpRequest - The incoming HTTP request
 * @returns {object}
 */
function createRequest (httpRequest) {
  let apiGatewayRequest = _.cloneDeep(sampleRequest);

  apiGatewayRequest.path = httpRequest.path;
  apiGatewayRequest.httpMethod = httpRequest.method.toUpperCase();
  apiGatewayRequest.pathParameters.proxy = httpRequest.path;
  apiGatewayRequest.queryStringParameters = httpRequest.query;
  apiGatewayRequest.body = querystring.stringify(httpRequest.body);
  apiGatewayRequest.requestContext.path = httpRequest.path;
  apiGatewayRequest.requestContext.requestId = uuid.v4();
  apiGatewayRequest.requestContext.identity.userAgent = httpRequest.get('User-Agent');

  Object.assign(apiGatewayRequest.headers, httpRequest.headers);

  if (httpRequest.ip) {
    apiGatewayRequest.headers['X-Forwarded-For'] = httpRequest.ip;
    apiGatewayRequest.requestContext.identity.sourceIp = httpRequest.ip;
  }

  return apiGatewayRequest;
}

/**
 * Creates an AWS API Gateway context object from a request object.
 *
 * @param {object} apiGatewayRequest - The AWS API Gateway request object
 * @returns {object}
 */
function createContext (apiGatewayRequest) {
  let context = _.cloneDeep(sampleContext);

  context.invokeid = apiGatewayRequest.requestContext.requestId;
  context.awsRequestId = apiGatewayRequest.requestContext.requestId;

  return context;
}
