'use strict';

const util = require('../util');
const Response = require('../Response');
const manifest = require('../../package.json');

module.exports = apiInfo;

/**
 * Returns information about the Trendsetter API.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function apiInfo (request) {
  return new Promise((resolve) => {
    let hostname = util.getHostName(request);

    resolve(Response.ok({
      name: 'Trendsetter API',
      version: manifest.version,
      description: manifest.description,
      links: {
        docs: 'https://documenter.getpostman.com/view/220187/trendsetter-api/2MuEBW',
        trends: `${hostname}/trends`,
        www: manifest.homepage,
      }
    }));
  });
}
