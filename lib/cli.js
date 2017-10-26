#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _checkEnv = require('check-env');

var _checkEnv2 = _interopRequireDefault(_checkEnv);

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _lodash = require('lodash');

var _helpers = require('./helpers');

var helpers = _interopRequireWildcard(_helpers);

var _errors = require('./errors');

var _package = require('../package.json');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readJSONConfig(filePath) {
  const configFile = _fs2.default.readFileSync(filePath, { encoding: 'utf8' });
  try {
    return JSON.parse((0, _stripJsonComments2.default)(configFile));
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new _errors.ConfigurationError('The configuration file contains invalid JSON');
    } else {
      throw err;
    }
  }
}

function run() {
  _commander2.default.version(_package.version).option('-c, --config <path>', 'Sets the path to the config file, otherwise read from the env variable CONFIG_FILE.').parse(process.argv);

  // If no config option is given, try to use the env variable:
  if (!_commander2.default.config) (0, _checkEnv2.default)(['CONFIG_FILE']);else process.env.CONFIG_FILE = _commander2.default.config;

  const completePath = _path2.default.resolve(process.cwd(), process.env.CONFIG_FILE);
  const config = (0, _lodash.endsWith)(process.env.CONFIG_FILE, '.js') ? require(completePath) : readJSONConfig(completePath);
  helpers.createBots(config);
}

exports.default = run;