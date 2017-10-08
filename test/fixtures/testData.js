'use strict';

const trendStore = require('../../lib/trendStore');
const sampleTrends = require('../../lib/sampleTrends.json');

module.exports = {
  /**
   * The sample trends for the "DEMO" account
   *
   * @type {object[]}
   */
  sampleTrends,

  /**
   * Creates multiple new test records, and updates the source objects
   * with any new or changed fields (such as auto-assigned IDs)
   *
   * @param {string} user - The current user's ID
   * @param {Trend[]} trends - The trends to create
   * @returns {Promise<Trend[]>} - Resolves with the updated source objects
   */
  create (user, trends) {
    return Promise.all(trends.map(trend => {
      return trendStore.create(user, trend)
        .then(updatedTrend => Object.assign(trend, updatedTrend.toResource()));
    }));
  },
};
