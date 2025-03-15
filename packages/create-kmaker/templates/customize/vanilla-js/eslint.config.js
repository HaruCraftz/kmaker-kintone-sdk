import cybozuKintonePrettierConfig from '@cybozu/eslint-config/flat/presets/kintone-customize-prettier.js';

export default [
  // cybozuConfig
  ...cybozuKintonePrettierConfig,
  // custom
  {
    ignores: ['node_modules/*', 'dist/**/*'],
  },
  {
    files: ['src/**/*.js'],
    langageOptions: {
      globals: {
        APPS_CONFIG: 'readonly',
      },
    },
  },
];
