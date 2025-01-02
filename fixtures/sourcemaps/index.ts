import assert from 'node:assert/strict';

export {};

try {
	await import('./error.ts');
} catch (error) {
	if (process.sourceMapsEnabled) {
		assert.match(error.stack, /\/error\.ts:2:7\)\n/);
	} else {
		assert.match(error.stack, /\/error\.ts:1:7\n/);
	}
}
