'use strict';

const Response = require('../Response');
const trendStore = require('../trendStore');
const sampleTrends = require('../sampleTrends.json');
const { findHeader } = require('../util');

module.exports = findTrends;

/**
 * Finds all trends, possibly filtered by query criteria.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findTrends (request) {
  return new Promise((resolve, reject) => {
    let user = findHeader(request.headers, 'X-API-Key');

    request.queryStringParameters = request.queryStringParameters || {};
    let type = request.queryStringParameters.type;
    let year = parseInt(request.queryStringParameters.year);

    trendStore.find(user, { type, year })
      .then(trends => {
        if (user === 'DEMO' && trends.length === 0 && !type && !year) {
          // Populate sample data for the "DEMO" account
          return Promise.all(sampleTrends.map(trend => trendStore.create(user, trend)));
        }
        else {
          return trends;
        }
      })
      .then(trends => resolve(Response.ok(trends)))
      .catch(reject);
  });
}
