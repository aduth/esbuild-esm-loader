# ESBuild ESM Loader

**ESBuild ESM Loader** is a custom resolver implementation for the [experimental module customization hooks](https://nodejs.org/docs/latest/api/module.html#customization-hooks) feature of Node.js ECMAScript modules.

Using this loader will enhance the default loader behavior to allow you to transform imported files using [ESBuild](https://esbuild.github.io/), allowing for transparent imports of modern JavaScript, JSX, and TypeScript.

```js
// index.jsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log(renderToStaticMarkup(<div>Hello World!</div>));
```

```
node --import=esbuild-esm-loader/register ./index.jsx
```

## Installation

The current version of the library requires **Node.js v16.12 or newer**.

Install as a dependency using `npm`. You will also need to install ESBuild, as it's a peer dependency of this project.

```
npm install esbuild esbuild-esm-loader
```

## Usage

Loaders can be defined as an argument when running `node`.

```
node --import=esbuild-esm-loader/register entry.js
```

## Configuration

If present, a `tsconfig.json` will be read and provided to ESBuild as the [`tsconfigRaw` option](https://esbuild.github.io/api/#tsconfig-raw). You can use this to control behavior such as JSX pragma with TypeScript's [`jsxFactory` configuration option](https://www.typescriptlang.org/tsconfig#jsxFactory). This applies even if you are not using TypeScript.

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

To better align with the experimental status of the loader hooks, initial releases will follow major version zero until the feature stabilizes in Node.js. Minor versions on the zero major will always include breaking changes. Patch versions on the zero major will include bug fixes and backwards-compatible changes.

Versioning will proceed from 1.0.0 once the feature stabilizes in Node.js.

## License

Copyright 2021 Andrew Duthie

Released under the MIT License. See [LICENSE.md](./LICENSE.md).
