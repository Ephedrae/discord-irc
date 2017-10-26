'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBots = createBots;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bot = require('./bot');

var _bot2 = _interopRequireDefault(_bot);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reads from the provided config file and returns an array of bots
 * @return {object[]}
 */
function createBots(configFile) {
  const bots = [];

  // The config file can be both an array and an object
  if (Array.isArray(configFile)) {
    configFile.forEach(config => {
      const bot = new _bot2.default(config);
      bot.connect();
      bots.push(bot);
    });
  } else if (_lodash2.default.isObject(configFile)) {
    const bot = new _bot2.default(configFile);
    bot.connect();
    bots.push(bot);
  } else {
    throw new _errors.ConfigurationError();
  }

  return bots;
}