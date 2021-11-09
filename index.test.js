import { readFile } from 'fs/promises';
import { expect } from 'chai';
import { getLoader, resolve, load } from './index.js';

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
