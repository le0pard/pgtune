# [PgTune](https://pgtune.leopard.in.ua/) [![Build and Deploy](https://github.com/le0pard/pgtune/actions/workflows/deploy.yml/badge.svg)](https://github.com/le0pard/pgtune/actions/workflows/deploy.yml)

[![PGTune](https://repository-images.githubusercontent.com/17980400/ff62f200-e3ae-11e9-9169-fcdbb1cbdb20 'PGTune')](https://pgtune.leopard.in.ua/)

Tuning PostgreSQL config by your hardware. Based on original [pgtune](https://github.com/gregs1104/pgtune). Illustration by [Kate](https://dribbble.com/Kite).

## Development

To start it in development mode, you need install node.js, yarn and run in terminal:

```bash
$ yarn # get all node.js deps
$ yarn dev # start server on 5173 port
```

Production build (with prerendered pages and service worker) can be checked with:

```bash
$ yarn build && yarn preview
```

### Checks

```bash
$ yarn lint # code style and lint checks (fix formatting with "yarn format")
$ yarn test # unit tests, "yarn test:watch" to rerun them on changes
$ yarn test:coverage # unit tests with coverage report in coverage/index.html
$ yarn playwright install chromium # once, browser for smoke tests
$ yarn test:e2e # smoke tests of production build in browser
```

Generated configurations for representative inputs are stored in `src/features/configuration/__tests__/__snapshots__/configurations`, so every change of calculated settings or warnings is visible in pull request. After a deliberate change, update them and review the difference:

```bash
$ yarn test -u
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
