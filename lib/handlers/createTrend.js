'use strict';

const Response = require('../Response');

module.exports = createTrend;

/**
 * Creates a new trend.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function createTrend () {
  return new Promise((resolve) => {
    let id = '12345abcdef';

    resolve(Response.created({
      id,
    }));
  });
}
