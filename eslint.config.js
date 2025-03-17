// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const files = ['src/**/*.tsx', 'src/**/*.ts'];

export default [
  {
    ...eslint.configs.recommended,
    files
  },
  ...tseslint.configs.recommended.map(conf => ({
    ...conf,
    files
  })),
  ...tseslint.configs.strict.map(conf => ({
    ...conf,
    files
  })),
  ...tseslint.configs.stylistic.map(conf => ({
    ...conf,
    files
  })),
  {
    ignores: [
      'src/api/**',
      'src/components/ui/**',
    ]
  },
]
