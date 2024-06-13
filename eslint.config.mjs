import globals from 'globals';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';

export default [
  {
    languageOptions: {
      parser: tsEslintParser,
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    rules: {
      'eol-last': 'off',
      'quotes': ['error', 'single'],
      'indent': 'off', // Default rule is disabled, customized below
      '@typescript-eslint/explicit-member-accessibility': 'off',
      'import/order': 'off',
      'max-len': ['error', { code: 150 }],
      '@typescript-eslint/member-ordering': 'off',
      'curly': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'no-empty': 'off',
      'arrow-parens': 'off',
      'sort-keys': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'one-var': 'off',
      'one-var-declaration-per-line': 'off',
      'no-unused-vars': 'warn',
    },
    ignores: ['package.json'],
  },
  {
    files: ['*.ts', '*.tsx'],
    rules: {
      'indent': ['error', 2],
    },
  },
];
