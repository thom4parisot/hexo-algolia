/* globals hexo:false, console:false*/
'use strict';

var fs = require('fs');
var path = require('path');
var command = require('./lib/command');
var searchTagHelper = require('./lib/helpers/search_tag.js');
var searchConfigHelper = require('./lib/helpers/search_config.js');

var KNOWN_ASSETS = [
  'algoliasearchLite.min.js',
  'algoliasearchLite.js',
  'algoliasearch.min.js',
  'algoliasearch.js'
];

hexo.extend.console.register(
  'algolia',
  'Index your content in Algolia Search API',
  {
    options: [
      { name: '--dry-run', desc: 'Does not push content to Algolia' },
      {
        name: '--flush',
        desc: 'Resets the Algolia index before starting the indexation'
      }
    ]
  },
  command
);

hexo.extend.helper.register(
  'algolia_search_cdn',
  searchTagHelper.fromCDN.bind(null, hexo)
);
hexo.extend.helper.register(
  'algolia_search',
  searchTagHelper.fromNpmPackage.bind(null, hexo)
);
hexo.extend.helper.register(
  'algolia_search_config',
  searchConfigHelper(hexo.config)
);

hexo.extend.generator.register('algolia', function() {
  return KNOWN_ASSETS.map(function(assetFile) {
    var sourceFile = require.resolve('algoliasearch/dist/' + assetFile);

    return {
      path: path.join('assets', 'algolia', assetFile),
      data: function() {
        return fs.createReadStream(sourceFile);
      }
    };
  });
});
