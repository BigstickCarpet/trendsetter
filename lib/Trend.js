'use strict';

const util = require('./util');
const validate = require('./validate');
const Response = require('./Response');
const querystring = require('querystring');

/**
 * Represents a single trend from the database.
 */
class Trend {
  constructor ({ id, name, type, from, to, user, expires }) {
    this.id = id || '';
    this.name = name || '';
    this.type = type || '';
    this.from = from || 0;
    this.to = to || 0;
    this.user = user || '';
    this.expires = expires || 0;
  }

  /**
   * Parses URL-encoded form data as a {@link Trend}
   *
   * @param {string} formData - The URL-encoded trend data
   * @returns {Trend}
   */
  static parse (formData) {
    let trend = querystring.parse(formData);
    trend.from = parseFloat(trend.from) || trend.from;
    trend.to = parseFloat(trend.to) || trend.to;
    return trend;
  }

  /**
   * Returns the trend as a REST resource, with HATEOAS links
   *
   * @param {object} [request] - The incoming HTTP request
   * @returns {object}
   */
  toResource (request) {
    let trend = {
      id: this.id,
      name: this.name,
      type: this.type,
      from: this.from,
      to: this.to,
    };

    if (request) {
      let hostname = util.getHostName(request);
      trend.links = {
        self: `${hostname}/trends/${this.id}`,
      };
    }

    return trend;
  }

  /**
   * Throws an error if any fields are invalid.
   */
  validate () {
    let { id, name, type, from, to, user, expires } = this;

    validate.guid('id', id);

    validate.nonEmptyString('name', name);
    validate.maxLength('name', name, 50);

    validate.nonEmptyString('type', type);
    validate.maxLength('type', type, 50);

    validate.year('from', from);
    validate.year('to', to);

    if (from > to) {
      throw Response.badRequest('The "from" year can\'t be greater than the "to" year');
    }

    validate.user(user);
    validate.positiveInteger('expires', expires);
  }
}

module.exports = Trend;
