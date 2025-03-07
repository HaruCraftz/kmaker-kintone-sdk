import globals from 'globals';
import cybozuConfig from '@cybozu/eslint-config/flat/presets/typescript-prettier.js';

export default [
  ...cybozuConfig,
  {
    ignores: ['node_modules/*', 'config/**/*', 'dist/**/*', 'scripts/**/*', 'webpack.*'],
  },
  {
    files: ['src/**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
