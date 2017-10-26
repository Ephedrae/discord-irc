'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.formatFromDiscordToIRC = formatFromDiscordToIRC;
exports.formatFromIRCToDiscord = formatFromIRCToDiscord;

var _ircFormatting = require('irc-formatting');

var _ircFormatting2 = _interopRequireDefault(_ircFormatting);

var _simpleMarkdown = require('simple-markdown');

var _simpleMarkdown2 = _interopRequireDefault(_simpleMarkdown);

var _ircColors = require('irc-colors');

var _ircColors2 = _interopRequireDefault(_ircColors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mdNodeToIRC(node) {
  let content = node.content;
  if (Array.isArray(content)) content = content.map(mdNodeToIRC).join('');
  if (node.type === 'em') return _ircColors2.default.italic(content);
  if (node.type === 'strong') return _ircColors2.default.bold(content);
  if (node.type === 'u') return _ircColors2.default.underline(content);
  return content;
}

function formatFromDiscordToIRC(text) {
  const markdownAST = _simpleMarkdown2.default.defaultInlineParse(text);
  return markdownAST.map(mdNodeToIRC).join('');
}

function formatFromIRCToDiscord(text) {
  const blocks = _ircFormatting2.default.parse(text).map(block => _extends({}, block, {
    italic: block.italic || block.reverse
  }));
  let mdText = '';

  for (let i = 0; i <= blocks.length; i += 1) {
    // Default to unstyled blocks when index out of range
    const block = blocks[i] || {};
    const prevBlock = blocks[i - 1] || {};

    // Add start markers when style turns from false to true
    if (!prevBlock.italic && block.italic) mdText += '*';
    if (!prevBlock.bold && block.bold) mdText += '**';
    if (!prevBlock.underline && block.underline) mdText += '__';

    // Add end markers when style turns from true to false
    // (and apply in reverse order to maintain nesting)
    if (prevBlock.underline && !block.underline) mdText += '__';
    if (prevBlock.bold && !block.bold) mdText += '**';
    if (prevBlock.italic && !block.italic) mdText += '*';

    mdText += block.text || '';
  }

  return mdText;
}