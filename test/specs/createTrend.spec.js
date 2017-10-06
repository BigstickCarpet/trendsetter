'use strict';

const apiGateway = require('../fixtures/apiGateway');
const assert = require('../fixtures/assert');

describe('Create new trends', () => {

  it('can create a new trend', () => {
    let newTrend = {
      name: 'My new trend',
      from: 2000,
      to: 2001,
    };

    return apiGateway.post('/trends', newTrend)
      .then(res => {
        res.should.be.an('object');
      });
  });

});
