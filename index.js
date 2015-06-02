/* globals hexo:false, console:false*/
'use strict';

var assign = require('object-assign');

var config = hexo.config.algolia = assign({
	chunkSize: 5000
}, hexo.config.algolia);

hexo.extend.generator.register('algolia-index', require('./lib/generator'));