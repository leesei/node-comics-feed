'use strict';

var FeedParser = require('feedparser');
var Wreck = require('wreck');

// https://github.com/isaacs/node-tap
var test = require('tap').test;

function processFeed(readStream, done) {
  var items = [];

  readStream.pipe(new FeedParser())
    .on('error', done)
    .on('readable', function () {
      var stream = this, item;
      // push all the items to be processed on 'end'
      while ((item = stream.read()) !== null) {
        // console.log(item);
        items.push({
          title:  item.title,
          url: item.origlink || item.link,
          description: item.description
        });
      }
    })
    .on('end', function () {
      done(null, items);
    });
}

function verifyLiveFeed(url, outFeed, t) {
  // TODO: verify number of items is the same
  // TODO: verify description contains an image URL

  // parse source feed
  // Wreck.get(url, function (err, response, payload) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   processFeed(Wreck.toReadableStream(payload), function (err, items) {
  //     console.warn(items);
  //   });
  // });

  // parse out feed
  processFeed(Wreck.toReadableStream(outFeed), function (err, items) {
    console.warn(items);
    t.end();
  });
}

function embedLiveFeed(url, t) {
  require('..').embedStrips(
    url,
    function (err, outFeed) {
      if (err) {
        console.error("error parsing: " + url);
        t.fail(err);
      }

      verifyLiveFeed(url, outFeed, t);
    }
  );
}

test('dilbert.com (live)', function (t) {
  embedLiveFeed("http://feed.dilbert.com/dilbert/daily_strip", t);
});

test('GoComics (live)', function (t) {
  embedLiveFeed("http://feeds.feedburner.com/uclick/dilbert-classics", t);
});

test('Explosm.net (live)', function (t) {
  embedLiveFeed("http://feeds.feedburner.com/Explosm", t);
});
