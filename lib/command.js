'use strict';

var _ = require('lodash');
var algoliasearch = require('algoliasearch');
var crypto = require('crypto');
var Promise = require('bluebird');
var log;

function computeSha1(text) {
    // change to 'md5' if you want an MD5 hash
    var hash = crypto.createHash('sha1');

    // change to 'binary' if you want a binary hash.
    hash.setEncoding('hex');

    // the text that you want to hash
    hash.write(text);

    // very important! You cannot read from the stream until you have called end()
    hash.end();

    // and now you get the resulting hash
    return hash.read();
}


module.exports = function (args, callback) {

    var hexo = this;
    var baseDir = hexo.base_dir;
    var config = hexo.config;
    var log = hexo.log;
    var posts = [];

    hexo.call('generate', function(err){
        if (err) return callback(err);
    });

    hexo.extend.filter.register('after_post_render', function(data){
        if(data.published){
            data.objectID = computeSha1(data.permalink);
            posts.push(_.pick(data, ['title', 'slug', 'permalink', 'content', 'excerpt', 'objectID']));
        }
        return data;
    });

    hexo.on('generateAfter', function(){
        log.info('[Algolia] Identified ' + posts.length + ' posts to index.');
        log.debug(posts);

        if(args && !args.f){
            // Initiliaze Algolia client
            var client = algoliasearch(config.algolia.applicationID, config.algolia.adminApiKey);
            var index = client.initIndex(config.algolia.indexName);

            if(args.w){
                indexPosts(index, posts);
            } else {
                log.info('[Algolia] Clearing index...');
                index.clearIndex(function(err, content) {
                    log.info('[Algolia] Index cleared.');
                    indexPosts(index, posts);
              });
            }

        } else {
            log.info('[Algolia] No data sent to Algolia due to the --fake option.');
        }
    });

    function end(err) {
        if (err) {
            throw err;
        }

        log.info('[Algolia] Import done.');
    }

    function indexPosts(index, posts){
        log.info('[Algolia] Starting indexation...');

        // Split our results into chunks, to get a good indexing/insert performance
        var chunkedResults = _.chunk(posts, config.algolia.chunks);

        // For each chunk of 5,000 objects, save to algolia, in parallel. Call end() when finished
        // or if any save produces an error
        Promise.all(chunkedResults.map(asyncSave)).then(end.bind(null, null), end);
    }

    function asyncSave (chunk) {
      return new Promise(function() {
        return index.saveObjects(chunk);
      });
    }
};
