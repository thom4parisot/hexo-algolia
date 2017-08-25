'use strict';

var _ = require('lodash');
var each = require('p-each-series');
var algoliasearch = require('algoliasearch');
var crypto = require('crypto');

var CONSOLE_DEFAULTS = {
  dryRun: false,
  flush: false,
  chunkSize: 50
};

function computeSha1(text) {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

module.exports = function(args, callback) {
  var hexo = this;
  var config = hexo.config;
  var HEXO_ALGOLIA_INDEXING_KEY = process.env.HEXO_ALGOLIA_INDEXING_KEY;

  var client = algoliasearch(
    config.algolia.applicationID,
    HEXO_ALGOLIA_INDEXING_KEY
  );

  hexo.log.info('[Algolia] Testing HEXO_ALGOLIA_INDEXING_KEY permissions.');

  Promise.all([hexo.load(), client.getApiKey(HEXO_ALGOLIA_INDEXING_KEY)])
    .then(function() {
      var posts = hexo.database.model('Post').find({ published: true });

      return posts.toArray();
    })
    .then(function(publishedPosts) {
      var pages = hexo.database.model('Page').find({
        layout: {
          '$in': ['page']
        }
      });

      return publishedPosts.concat(pages.toArray());
    })
    .then(function(publishedPagesAndPosts) {
      return publishedPagesAndPosts.map(function(data) {
        var storedPost = _.pick(data, [
          'title',
          'date',
          'slug',
          'content',
          'excerpt',
          'permalink',
          'layout'
        ]);

        storedPost.objectID = computeSha1(data.path);
        storedPost.date_as_int = Date.parse(data.date) / 1000;

        if (data.categories) {
          storedPost.categories = data.categories.map(function(item) {
            return _.pick(item, ['name', 'path']);
          });
        }

        if (data.tags) {
          storedPost.tags = data.tags.map(function(item) {
            return _.pick(item, ['name', 'path']);
          });
        }

        storedPost.author = data.author || config.author;

        return storedPost;
      });
    })
    .then(function(publishedPagesAndPosts) {
      hexo.log.info(
        '[Algolia] Identified ' + publishedPagesAndPosts.length + ' pages and posts to index.'
      );

      return publishedPagesAndPosts.map(function toAlgoliaBatchActions(post) {
        return {
          action: 'updateObject',
          indexName: config.algolia.indexName,
          body: post
        };
      });
    })
    .then(function(actions) {
      var options = _.assign({}, CONSOLE_DEFAULTS, args || {});

      if (options.dryRun) {
        hexo.log.info('[Algolia] Skipping due to --dry-run option');
        return;
      }

      var index = client.initIndex(config.algolia.indexName);

      return Promise.resolve(options.flush)
        .then(function(flush) {
          if (flush) {
            hexo.log.info('[Algolia] Clearing index...');
            return index.clearIndex();
          }
        })
        .then(function() {
          var chunks = _.chunk(actions, options.chunkSize);

          return each(chunks, function(chunk, i) {
            hexo.log.info(
              '[Algolia] Indexing chunk %d of %d (%d items each)',
              i + 1,
              chunks.length,
              options.chunkSize
            );

            return client.batch(chunk);
          });
        })
        .then(function() {
          hexo.log.info('[Algolia] Indexing done.');
        });
    })
    .catch(callback);
};
