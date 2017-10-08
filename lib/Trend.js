'use strict';

const util = require('./util');
const validate = require('./validate');
const Response = require('./Response');

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
   * Returns the given object as a {@link Trend}
   *
   * @param {object} trend - The object to convert to a trend
   * @returns {Trend}
   */
  static from (trend) {
    if (trend instanceof Trend) {
      return trend;
    }
    else {
      return new Trend(trend);
    }
  }

  /**
   * Returns the trend as a REST resource, with HATEOAS links
   *
   * @param {object} request - The incoming HTTP request
   * @returns {object}
   */
  toResource (request) {
    let hostname = util.getHostName(request);

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      from: this.from,
      to: this.to,
      links: {
        self: `${hostname}/trends/${this.id}`,
      }
    };
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
