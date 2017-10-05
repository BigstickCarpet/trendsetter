let express = require('express');
let bodyParser = require('body-parser');
let ono = require('ono');
let util = require('./util');

let trends = [];
let api = module.exports = express.Router();


// Parse HTTP request bodies
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json({ type (req) {
  return /json|text|undefined/.test(req.headers['content-type']);
} }));


// GET /trends
api.get('/trends', (req, res, next) => {
  res.json(util.sort(trends));
});


// DELETE /trends
api.delete('/trends', (req, res, next) => {
  // Reset all data
  trends = [];
  res.status(204).send();
});


// POST /trends
api.post('/trends', (req, res, next) => {
  // Validate the Trend
  let trend = util.validate(req.body);

  // Get any existing date ranges for this trend
  let existing = trends.filter(util.byName(trend.name));

  // Has this trend been popular too recently?
  let conflicts = existing.filter(util.between(trend.from - 10, trend.to + 10));

  if (conflicts.length === 0) {
    // Success! Add the new trend
    trends.push(trend);

    // Return all date ranges for this trend (including the new date range)
    existing.push(trend);
    res.status(201).json(util.sort(existing));
  }
  else {
    // Conflict!
    let conflict = conflicts[0];
    throw ono({ status: 409 }, '%s can\'t be trendy again so soon. It was already trendy from %d to %d',
      trend.name, conflict.from, conflict.to);
  }
});


// GET /trends/{filter}
api.get('/trends/:filter', (req, res, next) => {
  let filteredTrends = trends.filter(util.byNameOrYear(req.params.filter));
  if (filteredTrends.length > 0) {
    // Success! Return the trends
    res.json(util.sort(filteredTrends));
  }
  else {
    // No trends were found :(
    let year = parseInt(req.params.filter);
    throw ono({ status: 404 }, req.params.filter, year ? 'isn\'t a trendy year' : 'aren\'t trendy');
  }
});


// DELETE /trends/{name}
api.delete('/trends/:name', (req, res, next) => {
  let existing = trends.filter(util.byName(req.params.name));
  existing.forEach((trend) => {
    trends.splice(trends.indexOf(trend), 1);
  });
  res.status(204).send();
});
