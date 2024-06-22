import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import {
	isBareImport,
	getFilePathBase,
	isTransformCandidate,
	isTransformedExtension,
	isTransformed,
	getLoader,
	resolve,
	load,
} from './hooks.js';

describe('isBareImport', () => {
	it('returns true for bare import', () => {
		const result = isBareImport('esbuild-esm-loader');

		assert.strictEqual(result, true);
	});

	it('returns false for same-directory import', () => {
		const result = isBareImport('./foo');

		assert.strictEqual(result, false);
	});

	it('returns false for parent-directory import', () => {
		const result = isBareImport('../foo');

		assert.strictEqual(result, false);
	});

	it('returns false for root-directory import', () => {
		const result = isBareImport('/foo');

		assert.strictEqual(result, false);
	});

	it('returns false for file: import', () => {
		const result = isBareImport('file:foo');

		assert.strictEqual(result, false);
	});

	it('returns true for data: import', () => {
		const result = isBareImport('data:foo');

		assert.strictEqual(result, true);
	});

	it('returns true for node: import', () => {
		const result = isBareImport('node:foo');

		assert.strictEqual(result, true);
	});
});

describe('getFilePathBase', () => {
	it('returns path without search fragment', () => {
		const result = getFilePathBase('example.txt?s');

		assert.strictEqual(result, 'example.txt');
	});
});

describe('isTransformCandidate', () => {
	it('returns false for bare import', () => {
		const result = isTransformCandidate('esbuild-esm-loader');

		assert.strictEqual(result, false);
	});

	it('returns false for node modules path', () => {
		const result = isTransformCandidate(
			'../node_modules/esbuild-esm-loader/hooks.js',
		);

		assert.strictEqual(result, false);
	});

	it('returns true for extensionless valid candidate, e.g. relative import', () => {
		const result = isTransformCandidate('./esbuild-esm-loader');

		assert.strictEqual(result, true);
	});

	it('returns true for valid candidate with extension, e.g. relative import', () => {
		const result = isTransformCandidate('./esbuild-esm-loader.js');

		assert.strictEqual(result, true);
	});
});

describe('isTransformedExtension', () => {
	it('returns false for unsupported path extension', () => {
		const result = isTransformedExtension('example.txt');

		assert.strictEqual(result, false);
	});

	it('returns true for supported path extension', () => {
		const result = isTransformedExtension('example.js');

		assert.strictEqual(result, true);
	});

	it('returns true for supported path with multiple dots', () => {
		const result = isTransformedExtension('example.config.js');

		assert.strictEqual(result, true);
	});
});

describe('isTransformed', () => {
	it('returns false for bare import', () => {
		const result = isTransformed('esbuild-esm-loader');

		assert.strictEqual(result, false);
	});

	it('returns false for node modules path', () => {
		const result = isTransformed('../node_modules/esbuild-esm-loader/hooks.js');

		assert.strictEqual(result, false);
	});

	it('returns false for extensionless relative import', () => {
		const result = isTransformed('./esbuild-esm-loader');

		assert.strictEqual(result, false);
	});

	it('returns true for valid candidate with extension, e.g. relative import', () => {
		const result = isTransformed('./esbuild-esm-loader.js');

		assert.strictEqual(result, true);
	});
});

describe('getLoader', () => {
	it('returns loader', () => {
		const result = getLoader('file:///foo/bar.tsx');

		assert.strictEqual(result, 'tsx');
	});
});

describe('resolve', () => {
	const DEFAULT_RESOLVED = { url: '' };
	const DEFAULT_RESOLVE = () => Promise.resolve(DEFAULT_RESOLVED);

	it('resolves url for supported file', async () => {
		const specifier = './fixtures/in.jsx';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = {
			url: new URL('./fixtures/in.jsx', import.meta.url).toString(),
			shortCircuit: true,
		};

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		assert.deepStrictEqual(actual, expected);
	});

	it('resolves url for extensionless file', async () => {
		const specifier = './fixtures/in';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = {
			url: new URL('./fixtures/in.jsx', import.meta.url).toString(),
			shortCircuit: true,
		};

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		assert.deepStrictEqual(actual, expected);
	});

	it('defers for unsupported file', async () => {
		const specifier = './LICENSE.md';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = DEFAULT_RESOLVED;

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		assert.deepStrictEqual(actual, expected);
	});

	it('defers for ignored file', async () => {
		const specifier = './node_modules/@aduth/fixtures/in.jsx';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = DEFAULT_RESOLVED;

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		assert.deepStrictEqual(actual, expected);
	});
});

describe('load', () => {
	const DEFAULT_LOAD = (url) => Promise.resolve({ source: url });

	it('transforms source for supported file', async () => {
		const url = new URL('./fixtures/in.jsx', import.meta.url).toString();
		const expected = {
			source: await readFile('./fixtures/out.js', 'utf-8'),
			format: 'module',
			shortCircuit: true,
		};
		const context = { format: 'module' };

		const actual = await load(url, context, DEFAULT_LOAD);

		assert.deepStrictEqual(actual, expected);
	});

	it('defers for unsupported file', async () => {
		const url = new URL('LICENSE.md', import.meta.url).toString();
		const context = {
			format: 'module',
		};
		const expected = url;

		const { source: actual } = await load(url, context, DEFAULT_LOAD);

		assert.strictEqual(actual, expected);
	});

	it('defers for ignored file', async () => {
		const url = new URL(
			'./node_modules/@aduth/fixtures/in.jsx',
			import.meta.url,
		).toString();
		const context = {
			format: 'module',
		};
		const expected = url;

		const { source: actual } = await load(url, context, DEFAULT_LOAD);

		assert.strictEqual(actual, expected);
	});
});
