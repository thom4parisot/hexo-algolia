'use strict';

var BASE_URLS = {
  CDN: 'https://cdn.jsdelivr.net/algoliasearch/3/',
  LOCAL: 'assets/algolia/'
};

var DEFAULT_OPTIONS = {
  lite: true,
  min: true
};

function generateScriptTags (hexo, baseUrl, options) {
  var opts = Object.assign({}, DEFAULT_OPTIONS, options);
  var filename =
    'algoliasearch' +
    (opts.lite ? 'Lite' : '') +
    (opts.min ? '.min' : '') +
    '.js';

  return '<script src="' + hexo.config.root + baseUrl + filename +'" async></script>';
}

/* used as <%- algolia_search_cdn({ ...}) %> */
module.exports.fromCDN = function(hexo, options) {
  return generateScriptTags(hexo, BASE_URLS.CDN, options);
};

/* used as <%- algolia_search({ ... }) %> */
module.exports.fromNpmPackage = function(hexo, options) {
  return generateScriptTags(hexo, BASE_URLS.LOCAL, options);
};
