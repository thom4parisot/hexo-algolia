# hexo-algolia changelog

## v1.2.5, 2018-04-05

- index tags/categories only if they are arrays ([#33](https://github.com/oncletom/hexo-algolia/issues/33))
- update dependencies ([3b8bfce](https://github.com/oncletom/hexo-algolia/commit/3b8bfce))

## v1.2.4, 2017-12-17

- Fix `--flush` flag documentation ([#30](https://github.com/oncletom/hexo-algolia/pull/30))

## v1.2.3, 2017-08-31

- remove lodash from dependencies ([#25](https://github.com/oncletom/hexo-algolia/pull/25))

## v1.2.2, 2017-08-31

- do not index `page.content` as it causes the indexing to fail if it is bigger than 10kB ([#24](https://github.com/oncletom/hexo-algolia/pull/24), [#15](https://github.com/oncletom/hexo-algolia/issues/15))
- index `page.updated` (and its `page.updated_as_int` counterpart) [#24](https://github.com/oncletom/hexo-algolia/pull/24)

## v1.2.1, 2017-08-25

- add clearer signposting for error reasons, esp no API key or Admin Key provided ([#22](https://github.com/oncletom/hexo-algolia/pull/22), [#15](https://github.com/oncletom/hexo-algolia/issues/15))

## v1.2.0, 2017-08-25

- remove chunk size from options — the default was decreased from `5000` to `50` items at a time
- index pages along with publishedPosts in the index ([#21](https://github.com/oncletom/hexo-algolia/pull/21), [#18](https://github.com/oncletom/hexo-algolia/issues/18))
- fix helper name in docs ([#16](https://github.com/oncletom/hexo-algolia/pull/16))

## v1.1.0, 2017-06-08

- add `algolia_search()`, `algolia_search_cdn()` and `algolia_search_config()` hexo helpers ([#13](https://github.com/oncletom/hexo-algolia/pull/13))

## v1.0.1, 2017-06-01

- node>=4.0.0 jshint compat

## v1.0.0, 2017-06-01

- rename flags, remove AdminAPIKey from config and document things a bit more
