# Contributing to Sheet Diff

Use Node.js 22 or newer and run `npm ci`, `npm run check` and `npm test`.

Use `npm run test:watch` while changing the comparison logic. `npm run examples` regenerates the synthetic sample files.

Serve `dist/` with a static HTTP server, as described in the README. There is no build step. Keep the application usable without a backend or runtime CDN dependencies.

For comparison changes, include focused regression coverage in `tests/core.test.mjs`. For interface changes, check narrow and wide layouts, keyboard access, file selection, the inventory demo, filters, search and Excel export.

Explain the problem and resulting behavior in your pull request. Use synthetic spreadsheet data and retain third-party license notices when updating bundled dependencies.
