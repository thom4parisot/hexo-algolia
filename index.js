/* globals hexo:false, console:false*/
'use strict';

var assign = require('lodash').assign;

var config = hexo.config.algolia = assign({
	chunkSize: 5000
}, hexo.config.algolia);

hexo.extend.console.register('algolia', 'Index your content in Algolia Search API', {
  options: [
		{name: '--chunk-size=5000', desc: 'Chunk size for each batch of content to index'},
    {name: '--dry-run', desc: 'Does not push content to Algolia'},
    {name: '--flush', desc: 'Does not reset the Algolia index before starting the indexation'}
  ]
}, require('./lib/command'));
