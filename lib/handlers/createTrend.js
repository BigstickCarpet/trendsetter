"use strict";

const util = require("../util");
const trendStore = require("../trendStore");
const Response = require("../Response");
const Trend = require("../Trend");

module.exports = createTrend;

/**
 * Creates a new trend.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function createTrend (request) {
  return new Promise((resolve, reject) => {
    let user = util.findHeader(request.headers, "X-API-Key");
    let trend = Trend.parse(request.body);

    if (trend.id) {
      throw Response.badRequest('You can\'t set "id" value when creating a trend');
    }

    trendStore.create(user, trend)
      .then(newTrend => {
        newTrend = newTrend.toResource(request);
        let response = Response.created(newTrend, {
          Location: newTrend.links.self,
        });

        resolve(response);
      })
      .catch(reject);
  });
}
