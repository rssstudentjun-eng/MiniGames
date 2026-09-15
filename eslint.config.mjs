import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  {
    linterOptions: {
      noInlineConfig: true,
    },
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  unicorn.configs.recommended,

  {
    files: ['**/*.ts'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
