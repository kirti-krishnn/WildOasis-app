# TypeScript Migration Build Notes

This server now uses TypeScript, but it is still a Node.js ESM project.

The important files are:

- `package.json`
- `tsconfig.json`
- `server.ts`
- `app.ts`
- `test-endpoints.ts`

## Why We Do Not Just Run `tsc` Then `node filename.js`

In a simple tutorial, the project often has one file:

```bash
tsc index.ts
node index.js
```

That works because TypeScript writes `index.js` beside `index.ts`.

This project is different:

1. It has many files, folders, and imports.
2. It uses ESM because `package.json` has `"type": "module"`.
3. TypeScript compiles source files into the `dist/` folder.
4. The app entry file is `server.ts`, not a random single file.
5. The smoke test runs TypeScript directly with `tsx`.

So after compilation, the runnable file is:

```bash
node dist/server.js
```

not:

```bash
node server.js
```

## Build Command

From the `server/` folder:

```bash
npm run build
```

This runs:

```bash
tsc
```

The compiler reads `tsconfig.json` and writes JavaScript files into:

```text
server/dist/
```

For example:

```text
server/server.ts -> server/dist/server.js
server/app.ts    -> server/dist/app.js
```

## Start Command

After building, start the compiled server with:

```bash
npm start
```

This runs:

```bash
node dist/server.js
```

That is the production-style flow:

```bash
npm run build
npm start
```

## Dev Command

During development, use:

```bash
npm run dev
```

This runs:

```bash
tsx watch server.ts
```

`tsx` lets Node run TypeScript source files directly without manually compiling first. It also watches for changes and restarts the server.

## Why Imports Use `.ts` In Source

The source files import local modules like this:

```ts
import User from './models/userModel.ts';
```

This is needed because `tsx` runs the TypeScript source files directly. If the source used `.js`, `tsx` would look for a real `.js` file beside the `.ts` file and fail with:

```text
ERR_MODULE_NOT_FOUND
```

But Node needs `.js` imports after compilation. That is why `tsconfig.json` includes:

```json
"allowImportingTsExtensions": true,
"rewriteRelativeImportExtensions": true
```

So TypeScript source can use:

```ts
import User from './models/userModel.ts';
```

and compiled JavaScript becomes:

```js
import User from './models/userModel.js';
```

## Why These Verification Commands Were Used

### 1. Build the whole server

```bash
npm run build
```

This checks that TypeScript can compile the whole backend into `dist/`.

### 2. Check direct TypeScript execution

```bash
npx.cmd tsx -e "import('./models/userModel.ts').then(() => console.log('tsx model import ok'))"
```

This checks that `tsx` can import a TypeScript source file directly.

That matters because the smoke test runs with:

```bash
tsx test-endpoints.ts
```

On Windows, `npx.cmd` avoids PowerShell execution-policy problems that can happen with `npx.ps1`.

### 3. Check compiled JavaScript execution

```bash
node -e "import('./dist/models/userModel.js').then(() => console.log('compiled model import ok'))"
```

This checks that the compiled JavaScript in `dist/` works with plain Node.

That matters because production start uses:

```bash
node dist/server.js
```

### 4. Run the smoke test

```bash
npm.cmd run test:endpoints
```

This runs:

```bash
tsx test-endpoints.ts
```

It verifies the API endpoints against the running server.

On Windows, `npm.cmd` avoids PowerShell execution-policy problems that can happen with `npm.ps1`.

## Normal Commands To Remember

Use these from `server/`:

```bash
npm run dev
```

for development.

```bash
npm run build
npm start
```

for compiled JavaScript.

```bash
npm.cmd run test:endpoints
```

for the endpoint smoke test on Windows.
