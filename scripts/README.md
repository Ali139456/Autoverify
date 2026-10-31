# Scripts

Operational and development utilities. Not used in production builds.

| Script | Purpose |
|--------|---------|
| `test-infoagent-warranty.mjs` | Smoke-test InfoAgent OAuth + warranty API (requires `.env.local`). |
| `sync-sample-walkaround.ps1` | Copy Mercedes C300 assets from `images/` into `public/sample/walkaround/`. |
| `extract-lav-css.mjs` | Regenerate LAV page CSS from a static HTML export (see file header). |
| `patch-lav-sample-pdf.mjs` | Patch the public LAV sample PDF metadata. |
| `smoke-*.mjs`, `integration-check.mjs` | Local API / lookup smoke tests. |
| `ravin-*.mjs`, `ops-ravin-trace.mjs` | Ravin partner debugging (credentials required). |
| `setup-stripe-promo-codes.ts`, `update-stripe-product-prices.ts` | One-off Stripe catalog maintenance. |

Run Node scripts from the repo root, e.g. `node --env-file=.env.local scripts/test-infoagent-warranty.mjs`.
