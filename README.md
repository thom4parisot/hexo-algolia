# hexo-algolia [![Build Status](https://travis-ci.org/oncletom/hexo-algolia.svg?branch=master)](https://travis-ci.org/oncletom/hexo-algolia)

> Index content in Algolia Search API.

## Options

You can configure this plugin in `_config.yml`.

``` yaml
algolia:
  applicationID: 'applicationID'
  apiKey: 'apiKey'
  adminApiKey: 'adminApiKey'
  indexName: 'indexName'
  chunkSize: 5000
```

- **applicationID** - Your application Id
- **apiKey** - Your API key (for read-only operation, like search)
- **adminApiKey** - Your admin API key, used for create, update and delete on your indices
- **indexName** - The name of the index to use
- **chunkSize** - Content to index is split in chunks, to get a good indexing/insert performance (Default: 5'000)

## Usage

Hexo-algolia provides the command `hexo algolia` for indexing content, with few options :

* `-f`, `--fake` : does not push content to Algolia
* `-w`, `--without-reset` : does not reset the Algolia index before starting the indexation
