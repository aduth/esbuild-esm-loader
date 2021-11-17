import { readFile } from 'fs/promises';
import { expect } from 'chai';
import { isBareImport, getLoader, resolve, load } from './index.js';

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
		};

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		expect(actual).to.deep.equal(expected);
	});

	it('resolves url for extensionless file', async () => {
		const specifier = './fixtures/in';
		const context = { conditions: [], parentURL: import.meta.url };
		const expected = {
			url: new URL('./fixtures/in.jsx', import.meta.url).toString(),
		};

		const actual = await resolve(specifier, context, DEFAULT_RESOLVE);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const specifier = './fixtures/in.txt';
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
		};
		const context = { format: 'module' };

		const actual = await load(url, context, DEFAULT_LOAD);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const url = new URL('example.txt', import.meta.url).toString();
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
			import.meta.url
		).toString();
		const context = {
			format: 'module',
		};
		const expected = url;

		const { source: actual } = await load(url, context, DEFAULT_LOAD);

		expect(actual).to.equal(expected);
	});
});
