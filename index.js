/* globals hexo:false, console:false*/
'use strict';

var command = require('./lib/command');
var searchCdnHelper = require('./lib/helpers/search_cdn.js');
var searchConfigHelper = require('./lib/helpers/search_config.js');

hexo.extend.console.register('algolia', 'Index your content in Algolia Search API', {
  options: [
		{name: '--chunk-size=5000', desc: 'Chunk size for each batch of content to index'},
    {name: '--dry-run', desc: 'Does not push content to Algolia'},
    {name: '--flush', desc: 'Does not reset the Algolia index before starting the indexation'}
  ]
}, command);

hexo.extend.helper.register('algolia_search_cdn', searchCdnHelper);
hexo.extend.helper.register('algolia_search_config', searchConfigHelper(hexo.config));
