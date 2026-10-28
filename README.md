# yuchen-site-tests

Functional tests for yuchen-site, written with Playwright and TypeScript.

Tests run against a live deployment given by the `BASE_URL` environment variable:

```sh
BASE_URL=https://example.com npx playwright test
```

Each test checks one requirement from `SPEC.md` and references the line it comes from.
