'use strict';

var _ = require('lodash');
var DEFAULT_OPTIONS = {
  lite: true,
  min: true
};

module.exports = function (options) {
  var opts = _.assign({}, DEFAULT_OPTIONS, options);
  var filename = 'algoliasearch'
    + (opts.lite ? 'Lite' : '')
    + (opts.min ? '.min' : '')
    + '.js'

  return '<script src="https://cdn.jsdelivr.net/algoliasearch/3/'+filename+'" async></script>';
}
