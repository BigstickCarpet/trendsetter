'use strict';

const Response = require('../Response');
const manifest = require('../../package.json');
const { findHeader } = require('../util');

module.exports = apiInfo;

/**
 * Returns information about the Trendsetter API.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function apiInfo (request) {
  return new Promise((resolve) => {
    let hostname = getHostName(request);

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

/**
 * Returns the server's hostname (e.g. "http://api.trendsetter.com")
 *
 * @param {object} request - The incoming HTTP request
 * @returns {string}
 */
function getHostName (request) {
  let hostname = findHeader(request.headers, 'Host');
  if (!hostname) {
    // There's no Host header, so we can't determine the hostname.
    // Instead, we'll just have to use relative paths
    return '';
  }

  let protocol = findHeader(request.headers, 'X-Forwarded-Proto') ||
    findHeader(request.headers, 'CloudFront-Forwarded-Proto') ||
    'https';

  return `${protocol}://${hostname}`;
}
