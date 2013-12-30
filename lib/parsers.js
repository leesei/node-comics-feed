
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
      callback(null, $('.strip').attr('src'));
    },
  },

  {
    name: "Dilbert.com",
    match: function (siteUrl) {
      return (/.*dilbert.com/.test(siteUrl.hostname));
    },
    scrape: function (baseUrl, $, callback) {
      img = $('.STR_Image > img').attr('src');
      // the image src is relative
      img = url.resolve(baseUrl, img);

      callback(null, img);
    }
  }
];

exports = module.exports = {
  createParser: function (siteUrl) {
    var result = null;
    parsedUrl = url.parse(siteUrl);
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
