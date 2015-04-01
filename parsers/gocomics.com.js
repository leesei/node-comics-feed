'use strict';

module.exports = {
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
};
