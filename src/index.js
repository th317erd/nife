const Utils     = require('./utils');
const JSONUtils = require('./json-utils');
const DataUtils = require('./data-utils');
const MathUtils = require('./math-utils');

module.exports = Object.assign(
  module.exports,
  Utils,
  JSONUtils,
  DataUtils,
  MathUtils,
);
