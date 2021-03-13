import esbuild from 'esbuild';

/** @typedef {'js'|'jsx'|'ts'|'tsx'} SupportedLoader */

/**
 * Pattern matching URLs subject to ESBuild transform.
 *
 * @type {RegExp}
 */
const TRANSFORMED_EXTENSIONS = /\.([jt]sx?)$/;

/**
 * Pattern matching URLs that should be ignored.
 *
 * @type {RegExp}
 */
const IGNORED_PATH = /node_modules/;

/**
 * Returns true if the given URL should be subject to ESBuild transform, or
 * false otherwise.
 *
 * @param {string} url URL to test.
 *
 * @return {boolean} Whether to transform.
 */
const isTransformed = (url) =>
	TRANSFORMED_EXTENSIONS.test(url) && !IGNORED_PATH.test(url);

/**
 * Returns the ESBuild loader corresponding to the given URL.
 *
 * @param {string} url URL to test.
 *
 * @return {esbuild.Loader=} Loader to use.
 */
export const getLoader = (url) =>
	/** @type {SupportedLoader} */ (url.match(TRANSFORMED_EXTENSIONS)?.[1]);

/**
 * @param {string} specifier
 * @param {{conditions: string[], parentURL?: string}} context
 * @param {function} defaultResolve
 *
 * @return {Promise<{url: string}>}
 */
export const resolve = (specifier, context, defaultResolve) =>
	isTransformed(specifier)
		? Promise.resolve({ url: new URL(specifier, context.parentURL).href })
		: defaultResolve(specifier, context, defaultResolve);

/**
 * @param {string} url
 * @param {{}} context
 * @param {function} defaultGetFormat
 *
 * @return {Promise<{format: string}>}
 */
export const getFormat = (url, context, defaultGetFormat) =>
	isTransformed(url)
		? Promise.resolve({ format: 'module' })
		: defaultGetFormat(url, context, defaultGetFormat);

/**
 * @param {string|SharedArrayBuffer|Uint8Array} source
 * @param {{format: string, url: string}} context
 * @param {function} defaultTransformSource
 *
 * @return {Promise<{source:string|SharedArrayBuffer|Uint8Array}>}
 */
export async function transformSource(source, context, defaultTransformSource) {
	const { url } = context;

	if (!IGNORED_PATH.test(url)) {
		const loader = getLoader(url);
		if (loader) {
			const { code } = await esbuild.transform(source.toString(), { loader });
			return { source: code };
		}
	}

	return defaultTransformSource(source, context, defaultTransformSource);
}
