'use strict';

module.exports = function(hexoConfig) {
  return function() {
    var algolia = hexoConfig.algolia;

    return (
      '<meta property="algolia:search" data-application-id="' +
      algolia.applicationID +
      '" data-api-key="' +
      algolia.apiKey +
      '" data-index-name="' +
      algolia.indexName +
      '">'
    );
  };
};
