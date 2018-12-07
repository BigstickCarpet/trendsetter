"use strict";

const _ = require("lodash");
const util = require("../util");
const Response = require("../Response");
const trendStore = require("../trendStore");
const sampleTrends = require("../sampleTrends.json");

module.exports = findTrends;

/**
 * Finds all trends, possibly filtered by query criteria.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findTrends (request) {
  return new Promise((resolve, reject) => {
    let user = util.findHeader(request.headers, "X-API-Key");

    request.queryStringParameters = request.queryStringParameters || {};
    let name = request.queryStringParameters.name;
    let type = request.queryStringParameters.type;
    let year = parseInt(request.queryStringParameters.year);

    trendStore.find(user, { name, type, year })
      .then(trends => {
        if (user === "DEMO" && trends.length === 0 && !type && !year) {
          // Populate sample data for the "DEMO" account
          return Promise.all(sampleTrends.map(trend => trendStore.create(user, trend)));
        }
        else {
          return trends;
        }
      })
      .then(trends => {
        // Sort the trends by year
        trends = _.sortBy(trends, "from");

        // Convert the trend models to REST resources
        let response = Response.ok(
          trends.map(trend => trend.toResource(request))
        );

        resolve(response);
      })
      .catch(reject);
  });
}
