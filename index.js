import { extname } from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import esbuild from 'esbuild';
import { getFilePath } from 'resolve-file-extension';

/** @typedef {'js'|'jsx'|'ts'|'tsx'} SupportedLoader */

/**
 * Pattern matching URLs subject to ESBuild transform.
 *
 * @type {string[]}
 */
const TRANSFORMED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

/**
 * Pattern matching URLs that should be ignored.
 *
 * @type {RegExp}
 */
const IGNORED_PATH = /node_modules/;

/**
 * Returns true if the given specifier is for a relative file, or false otherwise.
 *
 * @param {string} specifier Specifier to check.
 *
 * @return {boolean} Whether specifier is for a relative file.
 */
const isRelative = (specifier) => specifier[0] === '.';

/**
 * Returns true if the given URL should be subject to ESBuild transform, or
 * false otherwise.
 *
 * @param {string} specifier URL to test.
 *
 * @return {boolean} Whether to transform.
 */
function isTransformed(specifier) {
	if (IGNORED_PATH.test(specifier)) {
		return false;
	}

	const ext = extname(specifier);
	return ext ? TRANSFORMED_EXTENSIONS.includes(ext) : isRelative(specifier);
}

/**
 * Returns the ESBuild loader corresponding to the given URL.
 *
 * @param {string} url URL to test.
 *
 * @return {esbuild.Loader=} Loader to use.
 */
export const getLoader = (url) =>
	/** @type {SupportedLoader} */ (extname(url).slice(1));

/**
 * @param {string} specifier
 * @param {{conditions: string[], parentURL?: string}} context
 * @param {function} defaultResolve
 *
 * @return {Promise<{url: string}>}
 */
export async function resolve(specifier, context, defaultResolve) {
	if (isTransformed(specifier)) {
		let url = new URL(specifier, context.parentURL);
		if (!extname(specifier)) {
			const resolvedFile = await getFilePath(
				fileURLToPath(url),
				TRANSFORMED_EXTENSIONS
			);

			if (resolvedFile) {
				url = pathToFileURL(resolvedFile);
			}
		}

		return { url: url.href };
	}

	return defaultResolve(specifier, context, defaultResolve);
}

/**
 * @param {string} url
 * @param {{format: string}} context
 * @param {function} defaultLoad
 *
 * @return {Promise<{source:string|SharedArrayBuffer|Uint8Array, format: string}>}
 */
export async function load(url, context, defaultLoad) {
	if (isTransformed(url)) {
		const loader = getLoader(url);
		if (loader) {
			const source = await readFile(fileURLToPath(url));
			const { code } = await esbuild.transform(source.toString(), { loader });
			return { source: code, format: 'module' };
		}
	}

	return defaultLoad(url, context, defaultLoad);
}
