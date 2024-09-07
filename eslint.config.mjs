import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import airbnb from 'eslint-config-airbnb'
import _import from 'eslint-plugin-import';


export default [
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
      import: _import,
    },
    rules: {
      ...airbnb.rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',

      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling'],
            'index',
          ],

          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: './modules/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './controllers/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './core/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './shared/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './database/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './constants/**',
              group: 'internal',
              position: 'before',
            },
          ],

          pathGroupsExcludedImportTypes: ['internal', 'builtin'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'import/no-cycle': 'error',

      'prettier/prettier': 'error',
    },
  },
];