'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.message = message || 'Invalid configuration file given';
  }
}
exports.ConfigurationError = ConfigurationError;