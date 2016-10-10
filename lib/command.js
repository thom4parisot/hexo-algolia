'use strict';

var _ = require('lodash');
var each = require('each-async');
var algoliasearch = require('algoliasearch');
var crypto = require('crypto');
var Promise = require('bluebird');
var log;

function computeSha1(text) {
  return crypto
    .createHash('sha1')
    .update(text, 'utf8')
    .digest('hex');
}


module.exports = function (args, callback) {
  var hexo = this;
  var config = hexo.config;

  hexo.load()
    .then(function() {
      return hexo.database.model('Post')
	.find({})
	.filter(function(data) {
	  return data.published;
	})
	.map(function(data) {
	  var storedPost = _.pick(data, ['title', 'date', 'slug', 'content', 'excerpt', 'permalink']);

	  storedPost.objectID = computeSha1(data.path);

	  storedPost.categories = data.categories.map(function(item){
	    return _.pick(item, ['name', 'path']);
	  });

	  storedPost.tags = data.tags.map(function(item){
	    return _.pick(item, ['name', 'path']);
	  });

	  storedPost.author = data.author || config.author;

	  return storedPost;
	});
    })
    .then(function(posts) {
      hexo.log.info('[Algolia] Identified ' + posts.length + ' posts to index.');

      return posts.map(function toAlgoliaBatchActions(post){
	return {
	  action: 'updateObject',
	  indexName: config.algolia.indexName,
	  body: post
	};
      });
    })
    .then(function(actions) {
      // Initiliaze Algolia client
      var client = algoliasearch(config.algolia.applicationID, config.algolia.adminApiKey);

      if(args && (!args.f || !args.fake)) {
	if(args.w || args.withoutReset){
	  hexo.log.info('[Algolia] Skipping index reset.');
	  indexPosts(client, actions);
	}
	else {
	  hexo.log.info('[Algolia] Clearing index...');

	  var index = client.initIndex(config.algolia.indexName);

	  index.clearIndex(function(err, content) {
	    hexo.log.info('[Algolia] Index cleared.');
	    indexPosts(client, actions);
	  });
	}
      }
      else {
	hexo.log.info('[Algolia] No data sent to Algolia due to the --fake option.');
      }
    });

  function end(err) {
    if (err) {
      throw err;
    }

    hexo.log.info('[Algolia] Import done.');
  }

  function indexPosts(client, posts){
    hexo.log.info('[Algolia] Starting indexation...');

    // Split our results into chunks, to get a good indexing/insert performance
    var chunkedResults = _.chunk(posts, config.algolia.chunks);
    var saveObjects = function saveObjects (chunks, i, next) {
      client.batch(chunks, next);
    };

    each(chunkedResults, saveObjects, end);
  }
};
