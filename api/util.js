'use strict';

module.exports = {
  /**
   * Returns the value of the specified HTTP header, case-insensitively.
   *
   * @param {object} headers - The HTTP headers to search
   * @param {string} name - The header to return
   * @returns {?string} - Returns the header value, if found
   */
  findHeader (headers, name) {
    name = name.toLowerCase();

    for (let key of Object.keys(headers)) {
      if (key.toLowerCase() === name) {
        return headers[key];
      }
    }

    return null; // not found
  },
};
