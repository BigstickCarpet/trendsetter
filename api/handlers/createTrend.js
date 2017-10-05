'use strict';

const Response = require('../Response');
const trendStore = require('../trendStore');
const validate = require('../validate');
const querystring = require('querystring');

module.exports = findTrends;

/**
 * Finds all trends, possibly filtered by query criteria.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findTrends (request) {
  return new Promise((resolve, reject) => {
    let id = '12345abcdef';

    resolve(Response.created({
      id,
    }));
  });
}
