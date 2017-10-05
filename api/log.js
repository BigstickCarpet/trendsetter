'use strict';

const Response = require('./Response');
const { findHeader } = require('./util');
const serializeError = require('serialize-error');

module.exports = {
  /**
   * Logs the incoming HTTP request
   *
   * @param {object} request - The incoming HTTP request
   * @param {object} context - The AWS Lambda context object
   * @returns {object} - Returns the request
   */
  request (request, context) {
    let entry = createLogEntry(request, context);
    console.log(entry);
    return request;
  },

  /**
   * Logs the HTTP response
   *
   * @param {object} request - The incoming HTTP request
   * @param {object} response - The HTTP response
   * @param {object} context - The AWS Lambda context object
   * @returns {object} - Returns the response
   */
  response (request, response, context) {
    let entry = createLogEntry(request, context);

    // Insert response info at the beginning of the object
    entry = Object.assign({ status: response.statusCode }, entry);

    if (response.statusCode < 400) {
      console.log(entry);
    }
    else {
      // Extract the error code from the response body
      let match = /"error":"(.*?)"/.exec(response.body);
      entry.error = match && match[1];
      console.warn(entry);
    }

    return response;
  },

  /**
   * Logs an error that occurred while processing an HTTP request
   *
   * @param {Error|Response} error - The error that occurred
   * @param {object} request - The incoming HTTP request
   * @param {object} context - The AWS Lambda context object
   * @returns {object} - Returns the error response
   */
  error (error, request, context) {
    if (error instanceof Response) {
      return error;
    }
    else {
      let errorPojo = serializeError(error);
      let entry = createLogEntry(request, context);
      console.error(Object.assign(entry, errorPojo));

      return Response.error(error);
    }
  },
};

/**
 * Creates a log entry that contains essential information about the current HTTP request.
 *
 * @param {object} request - The incoming HTTP request
 * @param {object} context - The AWS Lambda context object
 * @returns {object} - Returns the log entry object
 */
function createLogEntry (request, context) {
  return {
    method: request.httpMethod,
    path: request.path,
    tenant: findHeader(request.headers, 'X-API-Key'),
    functionVersion: context.functionVersion,
    requestId: context.awsRequestId || context.invokeid,
  };
}
