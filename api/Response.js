'use strict';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * An HTTP response, in the format that's required by AWS API Gateway.
 */
class Response {
  /**
   * Creates an HTTP 200 (OK) response
   *
   * @param {object} body - The JSON body
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static ok (body, headers) {
    return new Response(200, body, headers);
  }

  /**
   * Creates an HTTP 201 (Created) response
   *
   * @param {object} body - The JSON body
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static created (body, headers) {
    return new Response(201, body, headers);
  }

  /**
   * Creates an HTTP 404 (Not Found) response that indicates that the URL path could not be found
   * (as opposed to a path with an ID that can't be found in the database).
   *
   * @param {object} body - The JSON body
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static pathNotFound (message, headers) {
    return new Response(404, { error: 'BAD_PATH', message }, headers);
  }

  /**
   * Creates an HTTP 405 (Method Not Allowed) response.
   *
   * @param {object} body - The JSON body
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static methodNotAllowed (message, headers) {
    return new Response(405, { error: 'BAD_METHOD', message }, headers);
  }

  /**
   * Creates a {@link Response} object from an {@link Error} object.
   *
   * @param {Error|Response} error - The error, or an existing error response
   * @returns {Response}
   */
  static error (error) {
    if (error instanceof Response) {
      return error;
    }
    else {
      return new Response(
        error.statusCode || 500,
        {
          error: error.code || error.name || 'SERVER_ERROR',
          message: error.message || 'An error occurred on the server',
        }
      );
    }
  }

  /**
   * Creates an HTTP response.
   *
   * @param {number} statusCode - The HTTP status code
   * @param {object} body - The JSON body
   * @param {object} [headers] - HTTP headers
   */
  constructor (statusCode, body, headers) {
    this.statusCode = statusCode;
    this.body = JSON.stringify(body);
    this.headers = Object.assign({}, defaultHeaders, headers);
  }
}

module.exports = Response;
