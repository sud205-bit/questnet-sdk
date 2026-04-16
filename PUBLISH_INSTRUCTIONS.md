# Publish @questnet/sdk to npm

The SDK has been built successfully. To publish, run the following commands:

## Prerequisites

1. Log in to npm (or set up an auth token):
   ```bash
   npm login
   # or set NPM_TOKEN in your environment and add to ~/.npmrc:
   # //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   ```

2. Ensure you have access to the `@questnet` npm organization.

## Publish

```bash
cd /home/user/workspace/questnet-sdk
npm publish --access public
```

## Verify

After publishing, verify the package is live:

```bash
npm view @questnet/sdk
```

Or visit: https://www.npmjs.com/package/@questnet/sdk

## Build Output

The dist/ directory contains:
- `dist/index.js` — CommonJS build
- `dist/index.mjs` — ESM build
- `dist/index.d.ts` — TypeScript declarations (CJS)
- `dist/index.d.mts` — TypeScript declarations (ESM)

## Notes

- The TypeScript fix applied: `String((body as Record<string, unknown>).message)` at line 353
  to handle `noUncheckedIndexedAccess: true` in tsconfig.json
- Package version: 0.1.0
- License: MIT
