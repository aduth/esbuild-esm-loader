# ESBuild ESM Loader

**ESBuild ESM Loader** is a custom resolver implementation for the [experimental loader hooks](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_loader_hooks) feature of Node.js ECMAScript modules.

Using this loader will enhance the default loader behavior to allow you to transform imported files using [ESBuild](https://esbuild.github.io/), allowing for transparent imports of modern JavaScript, JSX, and TypeScript.

```js
// index.jsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log(renderToStaticMarkup(<div>Hello World!</div>));
```

```
node --experimental-loader=esbuild-esm-loader ./index.jsx
```

## Installation

Install as a dependency using `npm`. You will also need to install ESBuild, as it's a peer dependency of this project.

```
npm install esbuild esbuild-esm-loader
```

## Usage

Loaders can be defined as an argument when running `node`.

```
node --experimental-loader=esbuild-esm-loader entry.js
```

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

To better align with the experimental status of the loader hooks, initial releases will follow major version zero until the feature stabilizes in Node.js. Minor versions on the zero major will always include breaking changes. Patch versions on the zero major will include bug fixes and backwards-compatible changes.

Versioning will proceed from 1.0.0 once the feature stabilizes in Node.js.

## License

Copyright 2021 Andrew Duthie

Released under the MIT License. See [LICENSE.md](./LICENSE.md).
