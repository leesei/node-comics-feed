'use strict';

var url = require('url');

/**
 * Parser = {
 *   name,
 *   match(),
 *   scrape()
 * }
 *
 * match():
 * @param {Object}   siteUrl  parsed url for the comic strips site
 * Returns whether this scraper can handle this site
 *
 * scrape():
 * @param {String}   baseUrl  url of the webpage containing the comic strip
 * @param {Object}   $        [cheerio](http://matthewmueller.github.io/cheerio/) object containing the parsed page
 * @param {Function} callback callback function to return the parsed strip image URL
 *
 * callback:
 * @param {Object}   error    error object if one occurs
 * @param {String}   img_url  the parsed strip image URL
 *
 */
var parsers = [
  {
    name: "GoComics",
    match: function (siteUrl) {
      return (/.*gocomics.com/.test(siteUrl.hostname));
    },
    scrape: function (baseUrl, $, callback) {
      var img = $('.strip').attr('src');
      if (img) {
        callback(null, img);
      }
      else {
        callback(new Error("no image found"));
      }
    },
  },

  {
    name: "Dilbert.com",
    match: function (siteUrl) {
      return (/.*dilbert.com/.test(siteUrl.hostname));
    },
    scrape: function (baseUrl, $, callback) {
      var img = $('.img-comic-link > img').attr('src');
      if (img) {
        callback(null, img);
      }
      else {
        callback(new Error("no image found"));
      }
    }
  },

  {
    // contributed by eguendelman
    name: "Cyanide & Happiness",
    match: function (siteUrl) {
      return (/.*explosm.net/.test(siteUrl.hostname));
    },
    scrape: function (baseUrl, $, callback) {
      var img = $('#main-comic').attr('src');
      if (img) {
          // the image src is "protocol-less"
          return callback(null, "http:" + img);
      }

      var vid = $('div#videoPlayer > iframe[src*="youtube.com"]').attr('src');
      if (vid) {
          // Try to see if there's a video instead of a comic
          // Ideally I want to embed the video, but for now we'll just embed the
          // thumbnail of the video
          var result = vid.match(/embed\/([^\?]+)\?/);
          if (result.length > 1) {
              var videoid = result[1];
              vid = "http://i1.ytimg.com/vi/" + videoid + "/hqdefault.jpg";
              return callback(null, vid);
          }
      }

      callback(new Error("no image found"));
    }
  }
];

exports = module.exports = {
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
