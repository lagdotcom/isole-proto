/*eslint-env node*/

/** @type {import('@types/eslint').ESLint.Options['baseConfig']} */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	settings: {
		react: { pragma: 'h', version: '16.0' },
	},
	plugins: [
		'@typescript-eslint',
		'prettier',
		'simple-import-sort',
		'sonarjs',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:sonarjs/recommended',
	],
	rules: {
		'array-callback-return': ['error'],
		'arrow-body-style': ['error', 'as-needed'],
		eqeqeq: ['error', 'always'],
		'no-invalid-this': ['error'],
		'object-shorthand': ['error', 'always'],

		'prettier/prettier': ['error', { endOfLine: 'crlf' }],
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'sonarjs/cognitive-complexity': ['warn'],
		'sonarjs/no-duplicate-string': ['off'],
	},
};
