import assert from 'node:assert/strict';
import a from './export-query.ts?val=a';
import b from './export-query.ts?val=b';

assert.equal(a, 'a');
assert.equal(b, 'b');
