'use strict';

const Response = require('./Response');
const { findHeader } = require('./util');
const serializeError = require('serialize-error');

let log = module.exports = {
  /**
   * Logs the incoming HTTP request
   *
   * @param {object} request - The incoming HTTP request
   * @param {object} context - The AWS Lambda context object
   * @returns {object} - Returns the request
   */
  request (request, context) {
    let entry = createLogEntry(request, context);
    log.write('info', entry);
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
      log.write('info', entry);
    }
    else {
      // Extract the error code from the response body
      let match = /"error":"(.*?)"/.exec(response.body);
      entry.error = match && match[1];
      log.write('warn', entry);
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
      log.write('error', Object.assign(entry, errorPojo));

      return Response.error(error);
    }
  },

  /**
   * Writes the given data to the console, except in test mode.
   *
   * @param {string} level - The log level (e.g. "info", "error", "warn")
   * @param {object} data - The JSON data to log
   */
  write (level, data) {
    if (process.env.NODE_ENV !== 'test') {
      console[level](data);
    }
  }
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
    user: findHeader(request.headers, 'X-API-Key'),
    functionVersion: context.functionVersion,
    requestId: context.awsRequestId || context.invokeid,
  };
}