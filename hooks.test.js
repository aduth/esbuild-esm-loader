import { describe, it } from 'node:test';
import { readFile } from 'node:fs/promises';
import { expect } from 'chai';
import {
	isBareImport,
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

		expect(result).to.be.true;
	});

	it('returns false for same-directory import', () => {
		const result = isBareImport('./foo');

		expect(result).to.be.false;
	});

	it('returns false for parent-directory import', () => {
		const result = isBareImport('../foo');

		expect(result).to.be.false;
	});

	it('returns false for root-directory import', () => {
		const result = isBareImport('/foo');

		expect(result).to.be.false;
	});

	it('returns false for file: import', () => {
		const result = isBareImport('file:foo');

		expect(result).to.be.false;
	});

	it('returns false for data: import', () => {
		const result = isBareImport('data:foo');

		expect(result).to.be.false;
	});

	it('returns false for node: import', () => {
		const result = isBareImport('node:foo');

		expect(result).to.be.false;
	});
});

describe('isTransformCandidate', () => {
	it('returns false for bare import', () => {
		const result = isTransformCandidate('esbuild-esm-loader');

		expect(result).to.be.false;
	});

	it('returns false for node modules path', () => {
		const result = isTransformCandidate(
			'../node_modules/esbuild-esm-loader/hooks.js',
		);

		expect(result).to.be.false;
	});

	it('returns true for extensionless valid candidate, e.g. relative import', () => {
		const result = isTransformCandidate('./esbuild-esm-loader');

		expect(result).to.be.true;
	});

	it('returns true for valid candidate with extension, e.g. relative import', () => {
		const result = isTransformCandidate('./esbuild-esm-loader.js');

		expect(result).to.be.true;
	});
});

describe('isTransformedExtension', () => {
	it('returns false for unsupported path extension', () => {
		const result = isTransformedExtension('example.txt');

		expect(result).to.be.false;
	});

	it('returns true for supported path extension', () => {
		const result = isTransformedExtension('example.js');

		expect(result).to.be.true;
	});

	it('returns true for supported path with multiple dots', () => {
		const result = isTransformedExtension('example.config.js');

		expect(result).to.be.true;
	});
});

describe('isTransformed', () => {
	it('returns false for bare import', () => {
		const result = isTransformed('esbuild-esm-loader');

		expect(result).to.be.false;
	});

	it('returns false for node modules path', () => {
		const result = isTransformed('../node_modules/esbuild-esm-loader/hooks.js');

		expect(result).to.be.false;
	});

	it('returns false for extensionless relative import', () => {
		const result = isTransformed('./esbuild-esm-loader');

		expect(result).to.be.false;
	});

	it('returns true for valid candidate with extension, e.g. relative import', () => {
		const result = isTransformed('./esbuild-esm-loader.js');

		expect(result).to.be.true;
	});
});

describe('getLoader', () => {
	it('returns loader', () => {
		const result = getLoader('file:///foo/bar.tsx');

		expect(result).to.equal('tsx');
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

		expect(actual).to.deep.equal(expected);
	});

	it('resolves url for extensionless file', async () => {
		const specifier = './fixtures/in';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = {
			url: new URL('./fixtures/in.jsx', import.meta.url).toString(),
			shortCircuit: true,
		};

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const specifier = './LICENSE.md';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = DEFAULT_RESOLVED;

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for ignored file', async () => {
		const specifier = './node_modules/@aduth/fixtures/in.jsx';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = DEFAULT_RESOLVED;

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		expect(actual).to.deep.equal(expected);
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

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const url = new URL('LICENSE.md', import.meta.url).toString();
		const context = {
			format: 'module',
		};
		const expected = url;

		const { source: actual } = await load(url, context, DEFAULT_LOAD);

		expect(actual).to.equal(expected);
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

		expect(actual).to.equal(expected);
	});
});
