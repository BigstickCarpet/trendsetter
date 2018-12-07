"use strict";

const Response = require("../Response");

module.exports = updateTrend;

/**
 * Updates a trend
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function updateTrend () {
  return new Promise((resolve) => {
    let id = "12345abcdef";

    resolve(Response.ok({
      id,
    }));
  });
}
