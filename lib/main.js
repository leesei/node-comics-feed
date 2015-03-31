#!/usr/bin/env node

'use strict';

// https://github.com/danmactough/node-feedparser
// https://github.com/dylang/node-rss

var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var Wreck = require('wreck');

var parsers = require('./parsers');

var FeedParser = require('feedparser');
var RSS = require('rss');

var ONE_DAY_MINUTES = 60*24;

// module static
// FIXME: this is error-prune (re-entrance issue)
var opts = {};
var stripsParser = null;
var items = [];   // items from in-feed
var feed = null;  // out-feed

function _initFeed(meta) {
  // create out feed
  feed = new RSS({
      title: meta.title.replace(/^GoComics.com - /, ''),
      description: meta.description,
      generator: 'node-comics-scrape',
      feed_url: meta.xmlUrl,
      site_url: meta.link,
      pubDate: meta.pubDate,
      ttl: ONE_DAY_MINUTES
  });
}

function _loadStripUrl(url, scrapeFunc, callback) {
  // scrape the strip image from the strip webpage
  // using parser's scrapeFunc()
  Wreck.get(url,
    {
      redirects: 3,
    },
    function (err, res, payload) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    var $ = cheerio.load(payload, {
      ignoreWhitespace: true,
      xmlMode: false
    });

    // console.log(url);
    // console.log($.html());
    scrapeFunc(url, $, callback);
  });
}

function _finalizeFeed(callback) {
  if (opts.verbose) {
    console.info('Processing [%d] items ...', items.length);
  }

  if (!feed || items.length === 0) {
    return callback(new Error('no feed item available'));
  }

  // use map() to maintain the order of the items
  // each() is not stable (may rearrage items)
  async.map(items, function (item, callback) {
    // console.log('processing %j', item);

    _loadStripUrl(item.url, stripsParser.scrape, function (err, url) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      // console.log('%s => %s', item.title, url);
      item.description = '<img src="' + url + '"/>';
      callback(null, item);
    });
  }, function (err, results) {
    if (opts.verbose) {
      console.info('Done');
    }
    // console.log(results);

    // loop through the results and insert to out feed
    results.some(function (item) {
      feed.item(item);
    });

    callback(null, feed.xml('  '));
  });
}

function embedStrips(options, callback) {
  if (typeof options == "string") {
    opts.url = options;
  }
  else {
    opts = options;
  }

  var verbose = !!opts.verbose;

  async.waterfall([
    function (next) {
      // console.log(opts.url);
      next(null, opts.url);
    },
    function loadFeed(feedUrl, next) {
      // load the feed url or file and callback with the readable stream
      if (/^https?:\/\//.test(feedUrl)) {
        Wreck.get(feedUrl, function (err, response, payload) {
          if (err) {
            return callback(err);
          }
          next(null, Wreck.toReadableStream(payload));
        });
      }
      else {
        process.nextTick( function (){
          next(null, fs.createReadStream(feedUrl));
        });
      }
    },
    function processFeed(readStream, next) {
      if (verbose) {
        console.info('ReadStream ready ...');
      }

      readStream.pipe(new FeedParser())
        .on('error', callback)
        .on('meta', function (meta) {
          // console.log('meta: %s', JSON.stringify(meta, null, 2));
          _initFeed(meta);

          // select parser for the site
          stripsParser = parsers.createParser(meta.link);
          if (verbose) {
            console.info('Using [%s] parser', stripsParser.name);
          }
          if (!stripsParser) {
            return next(new Error('no parser available'));
          }
        })
        .on('readable', function () {
          var stream = this, item;
          // push all the items to be processed on 'end'
          while ((item = stream.read()) !== null) {
            // console.log(item);

            items.push({
              title:  item.title,
              url: item.origlink || item.link,
              description: ''
            });
          }
        })
        .on('end', function () {
          _finalizeFeed(next);
        });
    }
  ], function (err, feedXml) {
    // reset globals
    stripsParser = null;
    items = [];
    feed = null;

    callback(err, feedXml);
  });
}

exports = module.exports = {
  embedStrips: embedStrips
};
