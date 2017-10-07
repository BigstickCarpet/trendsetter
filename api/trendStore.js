'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const validate = require('./validate');

const TableName = process.env.TRENDSETTER_TABLE_NAME;
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
   * @param {string} user - The current user's ID
   * @param {object} trend - The trend to create
   * @returns {Promise<object>} - Resolves with the fully-populated trend object
   */
  create (user, trend) {
    trend = toTrendPOJO(trend);
    trend.id = uuid.v4().replace(/-/g, '');
    return trendStore.update(user, trend);
  },

  /**
   * Creates multiple new trends with new IDs.
   *
   * @param {string} user - The current user's ID
   * @param {object[]} trends - The trends to create
   * @returns {Promise<object[]>} - Resolves with an array of fully-populated trend objects
   */
  createMany (user, trends) {
    return Promise.all(
      trends.map(trend => trendStore.create(user, trend))
    );
  },

  /**
   * Updates an existing trend by its ID.
   *
   * @param {string} user - The current user's ID
   * @param {object} trend - The trend to update
   * @returns {Promise<object>} - Resolves with the fully-populated trend object
   */
  update (user, trend) {
    return new Promise((resolve, reject) => {
      validate.user('X-API-Key', user);
      validate.trend(trend);

      // Add metadata to the DynamoDB item
      trend = toTrendPOJO(trend);
      trend.user = user;
      trend.expires = getExpiryTime();

      dynamoDB.put({ TableName, Item: trend }, (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(toTrendPOJO(trend));
        }
      });
    });
  },

  /**
   * Deletes an existing trend by its ID.
   *
   * @param {string} user - The current user's ID
   * @param {string} id - The ID of the trend to delete
   * @returns {Promise} - Resolves without a return value
   */
  delete (user, id) {
    validate.user('X-API-Key', user);
    validate.guid('id', id);

    return Promise.reject(new Error('Not yet implemented'));
  },

  /**
   * Finds all trends that match the specified search criteria.
   *
   * @param {string} user - The current user's ID
   * @param {object} criteria - The search criteria
   * @param {string} [criteria.type] - The type of trends to search for
   * @param {number} [criteria.year] - The year to return trends for
   * @returns {Promise<object[]>} - Resolves with an array of trend objects
   */
  find (user, { type, year }) {
    return new Promise((resolve, reject) => {
      validate.user('X-API-Key', user);

      // By default, find all trends for this user
      let query = {
        TableName,
        FilterExpression: '#user = :user',
        ExpressionAttributeNames: {
          '#user': 'user'
        },
        ExpressionAttributeValues: {
          ':user': user,
        },
      };

      if (type) {
        validate.nonEmptyString('type', type);
        query.FilterExpression += ' and #type = :type';
        query.ExpressionAttributeNames['#type'] = 'type';
        query.ExpressionAttributeValues[':type'] = type;
      }

      if (year) {
        validate.year('year', year);
        query.FilterExpression += ' and :year between #from and #to';
        query.ExpressionAttributeNames['#from'] = 'from';
        query.ExpressionAttributeNames['#to'] = 'to';
        query.ExpressionAttributeValues[':year'] = year;
      }

      dynamoDB.scan(query, (err, results) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(results.Items.map(toTrendPOJO));
        }
      });
    });
  },
};

/**
 * Converts a DynamoDB Item to a trend object.
 *
 * @param {object} item - The DynamoDB item
 * @returns {object} - The trend object
 */
function toTrendPOJO (item) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    from: item.from,
    to: item.to,
  };
}

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
