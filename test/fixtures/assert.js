'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.should();

let assert = module.exports = {
  /**
   * Asserts that the given response is well formed.
   *
   * @param {object} response - The HTTP response to validate
   * @returns {object} - Returns the parsed response body
   */
  isValidResponse (response) {
    expect(response).to.be.an('object');
    response.should.have.keys('statusCode', 'headers', 'body');

    expect(response.statusCode).to.be.a('number');
    response.statusCode.should.be.at.least(100).and.below(600);

    expect(response.headers).to.be.an('object');
    for (let key of Object.keys(response.headers)) {
      expect(key).to.be.a('string').and.match(/^[a-z]+(\-[a-z]+)*$/i);
      expect(response.headers[key]).to.be.a('string');
    }

    expect(response.body).to.be.a('string').and.not.empty;
    return JSON.parse(response.body);
  },

  /**
   * Asserts that the given response is well formed and is not an error.
   *
   * @param {object} response - The HTTP response to validate
   * @returns {object} - Returns the parsed response body
   */
  isSuccessfulResponse (response) {
    let body = assert.isValidResponse(response);
    response.statusCode.should.be.at.least(200).and.below(300);
    return body;
  },

  /**
   * Asserts that the given response is well formed and is an error.
   *
   * @param {object} response - The HTTP response to validate
   * @returns {object} - Returns the parsed response body
   */
  isErrorResponse (response) {
    let body = assert.isValidResponse(response);

    response.statusCode.should.be.at.least(400).and.below(600);

    body.should.be.an('object');
    body.should.have.keys('error', 'message');
    body.error.should.be.a('string').and.match(/^[A-Z]+(_[A-Z]+)*$/);
    body.message.should.be.a('string').and.not.empty;

    return body;
  },
};
