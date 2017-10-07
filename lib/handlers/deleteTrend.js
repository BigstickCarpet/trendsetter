'use strict';

const Response = require('../Response');

module.exports = deleteTrend;

/**
 * Deletes a trend
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function deleteTrend () {
  return new Promise((resolve) => {
    let id = '12345abcdef';

    resolve(Response.ok({
      id,
      message: `Successfully deleted trend: "${id}"`,
    }));
  });
}
