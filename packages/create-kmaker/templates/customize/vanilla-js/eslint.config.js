import cybozuKintoneConfig from '@cybozu/eslint-config/flat/presets/kintone-customize.js';
import cybozuPretterConfig from '@cybozu/eslint-config/flat/presets/prettier.js';

export default [
  // cybozuConfig
  ...cybozuKintoneConfig,
  ...cybozuPretterConfig,
  // custom
  {
    ignores: ['node_modules/*', 'dist/**/*', 'webpack.*.js'],
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
