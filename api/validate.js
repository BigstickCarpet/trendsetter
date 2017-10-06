'use strict';

const Response = require('./Response');

const nextYear = new Date().getUTCFullYear() + 1;
const minimumYear = nextYear - 500;
const guidPattern = /^[a-f0-9]{32}$/;
const userIdPattern = /^[a-z0-9]+$/;

/**
 * Provides validation methods for fields.
 */
let validate = module.exports = {
  /**
   * Validates all user-provided fields of trend.
   * An error is thrown if anything is invalid.
   *
   * @param {object} trend - The trend to validate
   * @returns {object} - Returns the trend
   */
  trend (trend) {
    let { id, name, type, from, to } = trend;

    validate.guid('id', id);
    validate.nonEmptyString('name', name);
    validate.nonEmptyString('type', type);
    validate.year('from', from);
    validate.year('to', to);

    if (from > to) {
      throw Response.badRequest('The "from" year can\'t be greater than the "to" year');
    }

    return trend;
  },

  /**
   * Throws an error unless the specified value is a valid GUID (32 digit hex, without dashes)
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the GUID
   */
  guid (field, value) {
    validate.nonEmptyString(field, value);

    if (!guidPattern.test(value)) {
      throw Response.badRequest(`The "${field}" value must be a GUID (32 digit hex, without dashes)`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a valid User ID (an alphanumeric string).
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the User ID
   */
  user (field, value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw Response.unauthorized(`The ${field} header is missing`);
    }
    if (!userIdPattern.test(value)) {
      throw Response.unauthorized(`The ${field} header must be an alphanumeric string`);
    }
    if (value.length < 4) {
      throw Response.unauthorized(`The ${field} header is too short`);
    }
    if (value.length > 50) {
      throw Response.unauthorized(`The ${field} header is too long`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a string with at least one non-whitespace character.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the string
   */
  nonEmptyString (field, value) {
    if (typeof value !== 'string') {
      throw Response.badRequest(`The "${field}" value must be a string`);
    }
    if (!value || value.trim().length === 0) {
      throw Response.badRequest(`The "${field}" value is missing`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a valid year (within the last 500 years).
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {number} - Returns the year
   */
  year (field, value) {
    if (typeof value !== 'number') {
      throw Response.badRequest(`The "${field}" value must be a number (a 4 digit year)`);
    }
    if (!value) {
      throw Response.badRequest(`The "${field}" value is missing`);
    }
    if (value < minimumYear) {
      throw Response.badRequest(`${value} was too long ago. Try something newer.`);
    }
    if (value > nextYear) {
      throw Response.badRequest(`${value} is too far away. Stick with recent trends.`);
    }

    return value;
  },
};
