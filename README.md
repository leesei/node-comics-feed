# node-comics-feed

[![npm](https://img.shields.io/npm/v/comics-feed.svg?style=flat-square)](https://www.npmjs.com/comics-feed)
![Licence](https://img.shields.io/npm/l/comics-feed.svg?style=flat-square)
[![David](https://img.shields.io/david/leesei/node-comics-feed.svg?style=flat-square)](https://david-dm.org/leesei/node-comics-feed)

RSS feeds of comics sites usually contains the links to a webpage but not the strip images.  
This module iterates on the items on a feed and parse the webpages to create a new feed with embedded comic strips.

Supported websites:

* GoComics
* Dilbert.com
* Explosm.net (credits to [eguendelman](https://github.com/eguendelman))

> The list of parsers is meant to be extensible, see [`Parsers`](#parsers).  
> PRs are welcome.

Inspired by [gocomics-scrape](https://github.com/mihaip/gocomics-scrape) and re-implemented using Node.

## Usage

```sh
npm install comics-feed
comics-feed [.rss|url]
```

Turns [this](http://feed.dilbert.com/dilbert/daily_strip)

![Before](screenshots/dilbert-before.png)

into [this](http://leesei-comics-feed.herokuapp.com/embed/http%3A%2F%2Ffeed.dilbert.com%2Fdilbert%2Fdaily_strip)

![After](screenshots/dilbert-after.png)

(rendered by Firefox)

## Parsers

`parsers/*.js` will be loaded automatically by `parserFactory` as of 0.0.9.

A parser should have this interface:

```javascript
/**
 * Parser = {
 *   name,
 *   match(),
 *   scrape()
 * }
 *
 * match():
 * @param {Object}   siteUrl  parsed url for the comic strips site
 * Returns a boolean whether this scraper can handle this site 
 *
 * scrape():
 * @param {String}   baseUrl  url of the webpage containing the comic strip
 * @param {Object}   $        [cheerio](http://matthewmueller.github.io/cheerio/) object containing the parsed page
 * @param {Function} callback callback function to return the scraped info
 *
 * callback:
 * @param {Object}   error    error object if one occurs
 * @param {String}   imgUrl   URL for the strip's image 
 *
 */
```

## Tested on

See `test/live.js`

## TODO

- allow parsers to return custom description
- error handling
  - invalid URL
  - malformed feed
  - scraping error
- adds pubDate for items
- re-entrance
- module globals cleanup

## SaaS on Heroku

[heroku-comics-feed](https://github.com/leesei/heroku-comics-feed) uses this module to provide a subscribable RSS service.
