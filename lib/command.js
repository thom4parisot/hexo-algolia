'use strict';

var _ = require('lodash');
var algoliasearch = require('algoliasearch');
var crypto = require('crypto');

var CONSOLE_DEFAULTS = {
  dryRun: false,
  flush: false,
  chunkSize: 5000
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
      return hexo.database.model('Post').find({}).filter(function(data) {
        return data.published;
      });
    })
    .then(function(publishedPosts) {
      return publishedPosts.map(function(data) {
        var storedPost = _.pick(data, [
          'title',
          'date',
          'slug',
          'content',
          'excerpt',
          'permalink'
        ]);

        storedPost.objectID = computeSha1(data.path);
        storedPost.date_as_int = Date.parse(data.date) / 1000;

        storedPost.categories = data.categories.map(function(item) {
          return _.pick(item, ['name', 'path']);
        });

        storedPost.tags = data.tags.map(function(item) {
          return _.pick(item, ['name', 'path']);
        });

        storedPost.author = data.author || config.author;

        return storedPost;
      });
    })
    .then(function(publishedPosts) {
      hexo.log.info(
        '[Algolia] Identified ' + publishedPosts.length + ' posts to index.'
      );

      return publishedPosts.map(function toAlgoliaBatchActions(post) {
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
          hexo.log.info('[Algolia] Start indexing...');

          var chunkedResults = _.chunk(actions, options.chunkSize).map(function(
            chunk
          ) {
            return client.batch(chunk);
          });

          return Promise.all(chunkedResults);
        })
        .then(function() {
          hexo.log.info('[Algolia] Indexing done.');
        });
    })
    .catch(callback);
};
