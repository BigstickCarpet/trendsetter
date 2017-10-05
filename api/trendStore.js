'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const validate = require('./validate');

const tableName = process.env.TRENDSETTER_TABLE_NAME;
const ttlHours = parseInt(process.env.TRENDSETTER_TTL_HOURS) || 1;

// DynamoDB client API
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const trendStore = module.exports = {
  /**
   * Creates a new trend with a new ID.
   *
   * @param {object} trend - The trend to create
   * @returns {Promise<object>} - Resolves with the fully-populated trend object
   */
  create (trend) {
    trend.id = uuid.v4();
    return trendStore.update(trend);
  },

  /**
   * Updates an existing trend by its ID.
   *
   * @param {object} trend - The trend to create
   * @returns {Promise<object>} - Resolves with the fully-populated trend object
   */
  update (trend) {
    return new Promise((resolve, reject) => {
      validate.trend(trend);
      trend.expires = getExpiryTime();

      dynamoDB.put({ TableName: tableName, Item: trend }, (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(trend);
        }
      });
    });
  },

  /**
   * Deletes an existing trend by its ID.
   *
   * @param {string} id - The ID of the trend to delete
   * @returns {Promise} - Resolves without a return value
   */
  delete (id) {
    return Promise.reject(new Error('Not yet implemented'));
  },

  /**
   * Finds all trends that match the specified search criteria.
   *
   * @param {object} criteria - The search criteria
   * @param {string} criteria.type - The type of trends to search for
   * @param {number} criteria.year - The year to return trends for
   * @returns {Promise<object[]>} - Resolves with an array of trend objects
   */
  find ({ type, year }) {
    return Promise.reject(new Error('Not yet implemented'));
  },
};

/**
 * Becuase the Trendsetter API is intended for demo purposes, it automatically "resets" periodically.
 * Each item in the Trendsetter.Trends table has a TTL, after which the items are automatically deleted.
 * This function calculates the expiration date/time, based on the configured TTL.
 *
 * @returns {number} - The Unix Epoch time at which data expires
 */
function getExpiryTime () {
  let ttlMilliseconds = 1000 * 60 * 60 * ttlHours;
  let now = new Date();
  let expires = now.setUTCMilliseconds(ttlMilliseconds);

  // Return the TTL in seconds, not milliseconds
  return expires / 1000;
}
