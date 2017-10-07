'use strict';

const log = require('./log');
const Response = require('./Response');
const { findHeader } = require('./util');

const routes = [
  {
    pattern: /^\/?$/i,
    GET: require('./handlers/apiInfo'),
  },
  {
    pattern: /^\/trends\/?$/i,
    GET: require('./handlers/findTrends'),
    POST: require('./handlers/createTrend'),
  },
  {
    pattern: /^\/trends\/.+?\/?$/i,
    PUT: require('./handlers/updateTrend'),
    DELETE: require('./handlers/deleteTrend'),
  },
];

/**
 * Handles an incoming HTTP request from AWS API Gateway
 *
 * @param {object} request - The incoming HTTP request
 * @param {object} context - The AWS Lambda context object
 * @param {function} callback - The callback to send the HTTP response
 */
exports.handler = (request, context, callback) => {
  Promise.resolve()
    .then(() => log.request(request, context))
    .then(() => authenticateRequest(request))
    .then(() => findHandler(request))
    .then(handler => handler(request, context))
    .catch(error => log.error(error, request, context))
    .then(response => log.response(request, response, context))
    .then(response => callback(null, response));
};

/**
 * Ensures that the incoming HTTP request has a valid X-API-Key.
 * If the key is not set at all, then it will be set to "DEMO".
 * If it is set, but the value is invalid, then an error will be thrown.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {object} - Returns the authenticated request
 */
function authenticateRequest (request) {
  const apiKeyPattern = /^[a-z0-9]+$/i;
  let apiKey = findHeader(request.headers, 'X-API-Key');

  if (!apiKey) {
    // No API key was provided, so default to the "DEMO" account
    request.headers['X-API-Key'] = 'DEMO';
  }
  else if (!apiKeyPattern.test(apiKey)) {
    throw Response.unauthorized('The X-API-Key header must be an alphanumeric string');
  }
  else if (apiKey.length < 4) {
    throw Response.unauthorized('The X-API-Key header is too short');
  }
  else if (apiKey.length > 50) {
    throw Response.unauthorized('The X-API-Key header is too long');
  }

  return request;
}

/**
 * Finds the correct handler function for the incoming HTTP request.
 *
 * @param {object} request - The incoming HTTP request
 * @param {string} request.path - The URL path (e.g. "/trends/12345")
 * @param {string} request.httpMethod - The HTTP method (e.g. "GET")
 * @returns {Promise<function>} - Resolves with the handler function
 */
function findHandler ({ path, httpMethod }) {
  return new Promise(resolve => {
    // Find the route whose RegEx pattern matches the path
    let route = routes.find(r => r.pattern.test(path));
    if (!route) {
      throw Response.pathNotFound(`The Trendsetter API does not have a ${path} endpoint`);
    }

    // Find the handler function for the HTTP method
    let handler = route[httpMethod];
    if (!handler) {
      throw Response.methodNotAllowed(`The ${path} endpoint does not allow ${httpMethod}`);
    }

    resolve(handler);
  });
}
