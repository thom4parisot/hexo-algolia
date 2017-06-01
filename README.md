# hexo-algolia [![Build Status](https://travis-ci.org/oncletom/hexo-algolia.svg?branch=master)](https://travis-ci.org/oncletom/hexo-algolia)

> Index content in Algolia Search API.

## Install

```bash
$ npm install --save hexo-algolia
```

## Public Facing Search Options

You can configure the plugin in your hexo website `_config.yml` file:

``` yaml
algolia:
  applicationID: 'applicationID'
  apiKey: 'apiKey'
  indexName: '...'
```

- **applicationID** - Your application Id
- **apiKey** - Your API key (for read-only operation, like search)
- **indexName** - The name of the Algolia index to use

You can access them from your hexo theme in order to [instantiate the algolia client with the JavaScript client](https://www.algolia.com/doc/guides/search/auto-complete/#user-interface):

```html
<script src="https://cdn.jsdelivr.net/algoliasearch/3/algoliasearch.min.js"></script>
<script src="https://cdn.jsdelivr.net/autocomplete.js/0/autocomplete.min.js"></script>

<script>
var client = algoliasearch("<%- site.config.algolia.applicationID %>", "<%- site.config.algolia.apiKey %>");
var index = client.initIndex('<%- site.config.algolia.indexName %>');

// ...
</script>
```

## Indexing Content

Content can be indexed from the _command line_ with the help of the `hexo algolia` command.

```bash
$ ./node_modules/.bin/hexo algolia
```

### API Key

A separate _API Key_ must be provided as an **environment variable** named `HEXO_ALGOLIA_INDEXING_KEY`. Create it with **these limited write access** permissions: `Add records`, `Delete records`, `List indices`, `Delete index`.

```bash
$ export HEXO_ALGOLIA_INDEXING_KEY=…
$ ./node_modules/.bin/hexo algolia
```
![](algolia-write-key.png)

### Usage

```
$ ./node_modules/.bin/hexo help algolia
Usage: ./node_modules/.bin/hexo algolia

Description:
Index your content in Algolia Search API

Options:
  --chunk-size=5000  Chunk size for each batch of content to index
  --dry-run          Does not push content to Algolia
  --flush            Does not reset the Algolia index before starting the indexation
```

### Security Concerns

**Never use your _Admin API Key_** to index content — you might leak it by mistake and **it gives full control of your to others**. [Please read the Security guide thoroughly][security].



[batching]: https://www.algolia.com/doc/guides/indexing/import-synchronize-data/#batching
[security]: https://www.algolia.com/doc/guides/security/api-keys/
