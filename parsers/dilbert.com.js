'use strict';

module.exports = {
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
}
