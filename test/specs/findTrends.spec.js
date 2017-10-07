'use strict';

const trendStore = require('../../api/trendStore');
const sampleTrends = require('../../api/sampleTrends.json');
const apiGateway = require('../fixtures/apiGateway');
const assert = require('../fixtures/assert');

describe('Find trends', () => {

  it('requires authentication', () => {
    return apiGateway
      .auth(null)
      .get('/trends')
      .then(res => {
        let body = assert.isErrorResponse(res, 401);
        body.error.should.equal('UNAUTHORIZED');
        body.message.should.equal('The X-API-Key header is missing');
      });
  });

  it('returns sample trends if no trends exist', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    return apiGateway
      .auth(user)
      .get('/trends')
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(sampleTrends.length);
        trends.every(trend => delete trend.id);
        trends.should.have.same.deep.members(sampleTrends);
      });
  });

  it("returns all of the user's trends", () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
    ];

    return trendStore.createMany(user, testTrends)
      .then(updatedTrends => testTrends = updatedTrends)
      .then(() => apiGateway.auth(user).get('/trends'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.should.not.equal(testTrends);
        trends.should.have.same.deep.members(testTrends);
      });
  });

  it('returns an empty array if no trends match the criteria', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'TV Dinners', type: 'Food', from: 1954, to: 1961 },
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Vinyl Records', type: 'Music', from: 1984, to: 1985 },
    ];

    return trendStore.createMany(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?type=Fashion'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(0);
      });
  });

  it('returns only the trends match the type criteria', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return trendStore.createMany(user, testTrends)
      .then(updatedTrends => testTrends = updatedTrends)
      .then(() => apiGateway.auth(user).get('/trends?type=Toys'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.should.have.same.deep.members([testTrends[0], testTrends[3]]);
      });
  });

  it('returns only the trends match the year criteria', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return trendStore.createMany(user, testTrends)
      .then(updatedTrends => testTrends = updatedTrends)
      .then(() => apiGateway.auth(user).get('/trends?year=1990'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.should.have.same.deep.members([testTrends[0], testTrends[1]]);
      });
  });

  it('returns only the trends match both criteria', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return trendStore.createMany(user, testTrends)
      .then(updatedTrends => testTrends = updatedTrends)
      .then(() => apiGateway.auth(user).get('/trends?year=1990&type=TV%20Shows'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(1);
        trends.should.have.same.deep.members([testTrends[1]]);
      });
  });

});
