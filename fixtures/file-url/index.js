import { join } from 'node:path';

const aPath = join(import.meta.dirname, './a.ts');
const { default: a } = await import(`file:${aPath}`);
a();
