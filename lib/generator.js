'use strict';

var _ = require('lodash');
var async = require('async');
var algoliasearch = require('algoliasearch');
var log;

module.exports = function indexContent(locals) {
    var config = this.config;
    log = this.log;

    log.info('Starting Algolia indexation...');

    // Initiliaze Algolia client
    var client = algoliasearch(config.algolia.applicationID, config.algolia.apiKey);
    var index = client.initIndex(config.algolia.indexName);

    // Collect contents
    var results = [];

    // Posts
    locals.posts.each(function(post) {
        if (post.published) {
            var sanitizedPost = _.pick(post, ['title', 'slug', 'permalink', 'content']);
            sanitizedPost.objectID = post['_id'];
            results.push(sanitizedPost);
        }
    });

    // Pages
    locals.pages.each(function(page) {
        var sanitizedPage = _.pick(page, ['title', 'slug', 'permalink', 'content']);
        sanitizedPage.objectID = page['_id'];
        results.push(sanitizedPage);
    });

    log.info(results.length + ' elements found.');

    // Split our results into chunks, to get a good indexing/insert performance
    var chunkedResults = _.chunk(results, config.algolia.chunks);

    // For each chunk of 5,000 objects, save to algolia, in parallel. Call end() when finished
    // or if any save produces an error
    // https://github.com/caolan/async#eacharr-iterator-callback
    async.each(chunkedResults, index.saveObjects.bind(index), end);
};

function end(err) {
    if (err) {
        throw err;
    }
    
    log.info('Algolia import done');
}