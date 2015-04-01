'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');

// fs path is relative to cwd, use path.resolve() to get abs path
var files = fs.readdirSync(path.resolve(__dirname, '../parsers')).filter(function(name) {
  return /\.js$/i.test(path.extname(name));
});
// require path is relative to this file, use path.resolve() to get abs path
var parsers = files.map(function(file) {
  return require(path.resolve(__dirname, '../parsers', file));
});

module.exports = {
  createParser: function (siteUrl) {
    var result = null;
    var parsedUrl = url.parse(siteUrl);
    parsers.some(function (parser) {
      if (parser.match(parsedUrl)) {
        result = parser;
        return true;
      }
    });
    return result;
  },

  getParsers: function () {
    return parsers;
  },
};
