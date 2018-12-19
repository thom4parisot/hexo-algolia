'use strict';

var each = require('p-each-series');
var algoliasearch = require('algoliasearch');
var crypto = require('crypto');

var INDEXED_LAYOUTS = 'page';

var CONSOLE_DEFAULTS = {
  dryRun: false,
  flush: false,
  chunkSize: 50,
  layouts: INDEXED_LAYOUTS
};

var INDEXED_PROPERTIES = [
  'title',
  'date',
  'updated',
  'slug',
  'excerpt',
  'permalink',
  'layout',
  'image'
];

function computeSha1(text) {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

function pick(object, properties) {
  return properties.reduce(function(filteredObj, prop) {
    filteredObj[prop] = object[prop];
    return filteredObj;
  }, {});
}

function chunk(array, chunkSize) {
  var batches = [];

  while (array.length > 0) {
    batches.push(array.splice(0, chunkSize));
  }

  return batches;
}

module.exports = function(args, callback) {
  var hexo = this;
  var config = Object.assign({}, hexo.config.algolia);
  var indexName = config.indexName;
  var applicationID = config.applicationID;
  var options = Object.assign({}, CONSOLE_DEFAULTS, args || {});
  var pageLayouts = options.layouts.split(',');
  var apiKey = String(process.env.HEXO_ALGOLIA_INDEXING_KEY || options.indexingKey || '');
  var client;
  var index;

  Promise.resolve(apiKey)
    .then(function(){
      if (!apiKey) {
        hexo.log.error('[hexo-algolia] Please set an `HEXO_ALGOLIA_INDEXING_KEY` environment variable to enable content indexing.');
        hexo.log.error('>> Read %s for more informations.', 'https://npmjs.com/hexo-algolia#api-key');
        process.exit(1);
      }

      if (!indexName) {
        hexo.log.error('[hexo-algolia] Please provide an Algolia index name in your hexo _config.yml file.');
        hexo.log.error('>> Read %s for more informations.', 'https://npmjs.com/hexo-algolia#public-facing-search-options');
        process.exit(1);
      }

      client = algoliasearch(applicationID, apiKey);
      index = client.initIndex(indexName);
    })
    .then(function(){
      hexo.log.info('[hexo-algolia] Testing HEXO_ALGOLIA_INDEXING_KEY permissions.');

      return client.getApiKey(apiKey)
        .catch(function(err){
          hexo.log.error('[hexo-algolia] %s', err.message);
          hexo.log.error('>> You might have used an Admin Key or an invalid Key.');
          hexo.log.error('>> Read %s for more informations.', 'https://npmjs.com/hexo-algolia#security-concerns');
          process.exit(1);
        });
    })
    .then(function() {
      return hexo.load();
    })
    .then(function() {
      var posts = hexo.database.model('Post').find({ published: true });

      return posts.toArray();
    })
    .then(function(publishedPosts) {
      var pages = hexo.database.model('Page').find({
        layout: { '$in': pageLayouts }
      });

      return publishedPosts.concat(pages.toArray());
    })
    .then(function(publishedPagesAndPosts) {
      return publishedPagesAndPosts.map(function(data) {
        var storedPost = pick(data, INDEXED_PROPERTIES);

        storedPost.objectID = computeSha1(data.path);
        storedPost.date_as_int = Date.parse(data.date) / 1000;
        storedPost.updated_as_int = Date.parse(data.updated) / 1000;
        storedPost.permalink = storedPost.permalink.replace(/\/index.html$/, '/');

        if (data.categories && (Array.isArray(data.categories) || typeof data.categories.toArray === 'function')) {
          storedPost.categories = (data.categories.toArray ? data.categories.toArray() : data.categories).map(function(item) {
            return pick(item, ['name', 'path']);
          });
        }

        if (data.tags && (Array.isArray(data.tags) || typeof data.tags.toArray === 'function')) {
          storedPost.tags = (data.tags.toArray ? data.tags.toArray() : data.tags).map(function(item) {
            return pick(item, ['name', 'path']);
          });
        }

        storedPost.author = data.author || config.author;

        return storedPost;
      });
    })
    .then(function(publishedPagesAndPosts) {
      hexo.log.info(
        '[hexo-algolia] %d records to index (%s).',
        publishedPagesAndPosts.length,
        ['post'].concat(pageLayouts).join(', ')
      );

      return publishedPagesAndPosts.map(function toAlgoliaBatchActions(post) {
        return {
          action: 'updateObject',
          indexName: indexName,
          body: post
        };
      });
    })
    .then(function(actions) {
      if (options.dryRun) {
        hexo.log.info('[hexo-algolia] Skipping due to --dry-run option');
        return;
      }

      return Promise.resolve(options.flush)
        .then(function(flush) {
          if (flush) {
            hexo.log.info('[hexo-algolia] Clearing index...');

            return new Promise(function(resolve, reject){
              index.clearIndex(function(error, content){
                if (error) {
                  return reject(error);
                }

                index.waitTask(content.taskID, function(error) {
                  if (error) {
                    return reject(error);
                  }

                  return resolve();
                });
              });
            });
          }
        })
        .then(function() {
          var chunks = chunk(actions, options.chunkSize);

          return each(chunks, function(chunk, i) {
            hexo.log.info(
              '[hexo-algolia] Indexing chunk %d of %d (%d records)',
              i + 1,
              chunks.length,
              chunk.length
            );

            return client.batch(chunk)
              .catch(function(err){
                hexo.log.error('[hexo-algolia] %s', err.message);
              });
          });
        })

        .then(function() {
          hexo.log.info('[hexo-algolia] Indexing done.');
        });
    })
    .catch(callback);
};
