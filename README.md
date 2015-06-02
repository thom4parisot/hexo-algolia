# hexo-generator-feed

Index content in Algolia Search API.

## Options

You can configure this plugin in `_config.yml`.

``` yaml
algolia:
  applicationID: 'applicationID'
  apiKey: 'apiKey'
  indexName: 'indexName'
  chunkSize: 5000
```

- **applicationID** - Your application Id
- **apiKey** - Your API key
- **indexName** - The name of the index to use
- **chunkSize** - Content to index is split in chunks, to get a good indexing/insert performance (Default: 5'000)