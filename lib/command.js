'use strict';

var _ = require('lodash');
var async = require('async');
var algoliasearch = require('algoliasearch');
var log;

module.exports = function (args, callback) {

    var hexo = this;
    var baseDir = hexo.base_dir;
    var config = hexo.config;
    var log = hexo.log;

    hexo.extend.filter.register('before_post_render', function(data){
        if(data.published){
            data.objectID = 42;
            data.slug = data.slug;
            log.i('Before render :', data.permalink);
            hexo.post.create(data, true);
        }
        return data;
    });

    
    hexo.call('generate', function(err){
        if (err) return callback(err);

        log.info('Starting Algolia indexation...');
        // hexo.locals.cache.posts.each(function(post) {
        //     if (post.published) {
        //         var sanitizedPost = _.pick(post, ['title', 'slug', 'permalink', 'content']);
        //         sanitizedPost.objectID = post['_id'];
        //         log.i(sanitizedPost.title);
        //     }
        // });
});


    // // Initiliaze Algolia client
    // var client = algoliasearch(config.algolia.applicationID, config.algolia.adminApiKey);
    // var index = client.initIndex(config.algolia.indexName);

    // // Collect contents
    // var results = [];

    // // Posts
    // locals.posts.each(function(post) {
    //     if (post.published) {
    //         var sanitizedPost = _.pick(post, ['title', 'slug', 'permalink', 'content']);
    //         sanitizedPost.objectID = post['_id'];
    //         results.push(sanitizedPost);
    //     }
    // });

    // // Pages
    // locals.pages.each(function(page) {
    //     var sanitizedPage = _.pick(page, ['title', 'slug', 'permalink', 'content']);
    //     sanitizedPage.objectID = page['_id'];
    //     results.push(sanitizedPage);
    // });

    // log.info(results.length + ' elements found.');

    // // Split our results into chunks, to get a good indexing/insert performance
    // var chunkedResults = _.chunk(results, config.algolia.chunks);

    // // For each chunk of 5,000 objects, save to algolia, in parallel. Call end() when finished
    // // or if any save produces an error
    // // https://github.com/caolan/async#eacharr-iterator-callback
    // async.each(chunkedResults, index.saveObjects.bind(index), end);
};

function end(err) {
    if (err) {
        throw err;
    }
    
    log.info('Algolia import done');
}