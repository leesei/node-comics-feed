'use strict';

module.exports = {
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
