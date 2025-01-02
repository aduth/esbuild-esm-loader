import baseConfig from '@aduth/eslint-config';
import globals from 'globals';

export default [
	...baseConfig,
	{
		languageOptions: { globals: globals.node },
	},
	{
		ignores: ['**/fixtures/*'],
	},
];
