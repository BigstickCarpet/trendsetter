'use strict';

const apiGateway = require('../fixtures/apiGateway');
const testData = require('../fixtures/testData');
const assert = require('../fixtures/assert');

describe('Find trends', () => {

  it('returns sample trends for the demo user if no trends exist', () => {
    return apiGateway
      .auth('DEMO')
      .get('/trends')
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, testData.sampleTrends);
      });
  });

  it('returns an empty array if no trends exist for a non-demo user', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    return apiGateway
      .auth(user)
      .get('/trends')
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(0);
      });
  });

  it("returns all of the user's trends", () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
    ];

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, testTrends);
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

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?type=Fashion'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(0);
      });
  });

  it('returns only the trends match the name criteria', () => {
    // Use a unique User ID, so we know there's no existing trends
    let user = `${Date.now()}`;

    let testTrends = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?name=Arrested%20Development'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, [testTrends[1], testTrends[2]]);
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

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?type=Toys'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, [testTrends[0], testTrends[3]]);
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

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?year=1990'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(2);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, [testTrends[0], testTrends[1]]);
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

    return testData.create(user, testTrends)
      .then(() => apiGateway.auth(user).get('/trends?year=1990&type=TV%20Shows'))
      .then(res => {
        let trends = assert.isSuccessfulResponse(res, 200);
        trends.should.be.an('array').with.lengthOf(1);
        trends.forEach(assert.isValidTrend);
        assert.matchesTestData(trends, [testTrends[1]]);
      });
  });

});
