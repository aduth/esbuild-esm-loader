import { extname, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
export const isBareImport = (specifier) => !/^[./]|file:/.test(specifier);

/**
 * Returns the result of the given callback. The callback will only be called once, after which the
 * value from the first invocation is returned.
 *
 * @template {(...args: any[]) => any} F
 *
 * @param {F} callback Original callback.
 *
 * @return {F} Modified callback, invoking original only once.
 */
function once(callback) {
	let hasBeenCalled = false;
	let value;

	return /** @type {F} */ (
		() => {
			if (!hasBeenCalled) {
				hasBeenCalled = true;
				value = callback();
			}

			return value;
		}
	);
}

/**
 * Returns the string contents of a TypeScript configuration file relative to the current working
 * directory, or an empty string if one does not exist.
 */
const getTSConfigRaw = once(async () => {
	try {
		return await readFile('./tsconfig.json', 'utf-8');
	} catch {}
});

/**
 * Returns true if the given URL may be a candidate for transformation, or
 * false otherwise. A candidate for transformation is one which is not a
 * reference to a dependency.
 *
 * @param {string} specifier URL to test.
 *
 * @return {boolean} Whether to transform.
 */
export function isTransformCandidate(specifier) {
	return !IGNORED_PATH.test(specifier) && !isBareImport(specifier);
}

/**
 * Returns the base file path of a given path. If the path includes query parameters, the return
 * value is the path before the search fragment.
 *
 * @param {string} path Original path.
 *
 * @return {string} Path without search fragment.
 */
export const getFilePathBase = (path) => path.split('?')[0];

/**
 * Returns true if the given specifier has an extension which is subject to
 * transformation, or false otherwise.
 *
 * @param {string} specifier URL to test.
 *
 * @return {boolean} Whether to transform.
 */
export function isTransformedExtension(specifier) {
	return TRANSFORMED_EXTENSIONS.includes(extname(getFilePathBase(specifier)));
}

/**
 * Returns true if the given URL should be subject to ESBuild transform, or
 * false otherwise.
 *
 * @param {string} specifier URL to test.
 *
 * @return {boolean} Whether to transform.
 */
export function isTransformed(specifier) {
	return isTransformCandidate(specifier) && isTransformedExtension(specifier);
}

/**
 * Returns the ESBuild loader corresponding to the given URL.
 *
 * @param {string} url URL to test.
 *
 * @return {esbuild.Loader=} Loader to use.
 */
export const getLoader = (url) =>
	/** @type {SupportedLoader} */ (extname(getFilePathBase(url)).slice(1));

/**
 * @param {string} specifier
 * @param {{conditions: string[], parentURL?: string}} context
 * @param {function} defaultResolve
 *
 * @return {Promise<{url: string, shortCircuit?: boolean}>}
 */
export async function resolve(specifier, context, defaultResolve) {
	if (isTransformCandidate(specifier)) {
		const url = new URL(specifier, context.parentURL);
		if (url.protocol !== 'file:' || isTransformedExtension(specifier)) {
			return { url: url.href, shortCircuit: true };
		}

		const resolvedFile = await getFilePath(
			fileURLToPath(url),
			TRANSFORMED_EXTENSIONS,
		);

		if (resolvedFile) {
			return { url: pathToFileURL(resolvedFile).href, shortCircuit: true };
		}
	}

	return defaultResolve(specifier, context, defaultResolve);
}

/**
 * @param {string} url
 * @param {{format: string}} context
 * @param {function} defaultLoad
 *
 * @return {Promise<{source:string|SharedArrayBuffer|Uint8Array, format: string, shortCircuit?: boolean}>}
 */
export async function load(url, context, defaultLoad) {
	if (isTransformed(url)) {
		const loader = getLoader(url);
		if (loader) {
			const source = await readFile(fileURLToPath(url), 'utf-8');
			const tsconfigRaw = await getTSConfigRaw();

			/** @type {Partial<import('esbuild').TransformOptions>=} */
			const transformOptions = { loader, tsconfigRaw };
			if (process.sourceMapsEnabled) {
				Object.assign(transformOptions, {
					sourcemap: 'inline',
					sourcefile: basename(url),
					sourcesContent: false,
				});
			}

			const { code } = await esbuild.transform(source, transformOptions);
			return { source: code, format: 'module', shortCircuit: true };
		}
	}

	return defaultLoad(url, context, defaultLoad);
}
