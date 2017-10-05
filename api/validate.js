'use strict';

const nextYear = new Date().getUTCFullYear() + 1;
const minimumYear = nextYear - 100;
const guidPattern = /^[a-f0-9]{32}$/;

/**
 * Provides validation methods for fields.
 */
let validate = module.exports = {
  /**
   * Validates all user-provided fields of trend.
   * An error is thrown if anything is invalid.
   */
  trend (trend) {
    let { id, tenant, name, type, from, to } = trend;

    validate.guid('id', id);
    validate.nonEmptyString('tenant', tenant);
    validate.nonEmptyString('name', name);
    validate.nonEmptyString('type', type);
    validate.year('from', from);
    validate.year('to', to);

    if (from > to) {
      throw new Error('The "from" year can\'t be greater than the "to" year');
    }
  },

  /**
   * Throws an error unless the specified value is a valid GUID (32 digit hex, without dashes)
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {boolean}
   */
  guid (field, value) {
    validate.nonEmptyString(field, value);

    if (!guidPattern.test(value)) {
      throw new Error(`The "${field}" value must be a GUID (32 digit hex, without dashes)`);
    }
  },

  /**
   * Throws an error unless the specified value is a string with at least one non-whitespace character.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {boolean}
   */
  nonEmptyString (field, value) {
    if (typeof value !== 'string') {
      throw new Error(`The "${field}" value must be a string`);
    }
    if (!value || value.trim().length === 0) {
      throw new Error(`The "${field}" value is missing`);
    }
  },

  /**
   * Throws an error unless the specified value is a valid year (within the last 100 years).
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {boolean}
   */
  year (field, value) {
    if (typeof value !== 'number') {
      throw new Error(`The "${field}" value must be a number (a 4 digit year)`);
    }
    if (!value) {
      throw new Error(`The "${field}" value is missing`);
    }
    if (value < minimumYear) {
      throw new Error(`Nothing was trendy back in ${value}. Try something newer.`);
    }
    if (value > nextYear) {
      throw new Error(`${value} is too far away. Stick with recent trends.`);
    }
  },
};
