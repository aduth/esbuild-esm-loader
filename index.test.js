import { readFile } from 'fs/promises';
import { expect } from 'chai';
import { getLoader, resolve, getFormat, transformSource } from './index.js';

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

describe('getFormat', () => {
	const DEFAULT_FORMAT = { url: '' };
	const DEFAULT_GET_FORMAT = () => Promise.resolve(DEFAULT_FORMAT);

	it('returns module format for supported file', async () => {
		const url = new URL('./fixtures/in.jsx', import.meta.url).toString();
		const context = {};
		const expected = { format: 'module' };

		const actual = await getFormat(url, context, DEFAULT_GET_FORMAT);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const url = new URL('./fixtures/in.txt', import.meta.url).toString();
		const context = {};
		const expected = DEFAULT_FORMAT;

		const actual = await getFormat(url, context, DEFAULT_GET_FORMAT);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for ignored file', async () => {
		const url = new URL(
			'./node_modules/@aduth/fixtures/in.jsx',
			import.meta.url
		).toString();
		const context = {};
		const expected = DEFAULT_FORMAT;

		const actual = await getFormat(url, context, DEFAULT_GET_FORMAT);

		expect(actual).to.deep.equal(expected);
	});
});

describe('transformSource', () => {
	const DEFAULT_TRANSFORM_SOURCE = (source) => Promise.resolve({ source });

	it('transforms source for supported file', async () => {
		const url = new URL('./fixtures/in.jsx', import.meta.url);
		const source = await readFile(url);
		const expected = { source: await readFile('./fixtures/out.js', 'utf-8') };
		const context = { url: url.toString(), format: 'module' };

		const actual = await transformSource(
			source,
			context,
			DEFAULT_TRANSFORM_SOURCE
		);

		expect(actual).to.deep.equal(expected);
	});

	it('defers for unsupported file', async () => {
		const source = 'hello world';
		const context = {
			url: new URL('example.txt', import.meta.url).toString(),
			format: 'module',
		};
		const expected = 'hello world';

		const { source: actual } = await transformSource(
			source,
			context,
			DEFAULT_TRANSFORM_SOURCE
		);

		expect(actual).to.equal(expected);
	});

	it('defers for ignored file', async () => {
		const source = 'hello world';
		const context = {
			url: new URL(
				'./node_modules/@aduth/fixtures/in.jsx',
				import.meta.url
			).toString(),
			format: 'module',
		};
		const expected = 'hello world';

		const { source: actual } = await transformSource(
			source,
			context,
			DEFAULT_TRANSFORM_SOURCE
		);

		expect(actual).to.equal(expected);
	});
});
