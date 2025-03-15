import cybozuKintoneConfig from '@cybozu/eslint-config/flat/presets/kintone-customize.js';
import cybozuTsPritterConfig from '@cybozu/eslint-config/flat/presets/typescript-prettier.js';

export default [
  // cybozuConfig
  ...cybozuKintoneConfig,
  ...cybozuTsPritterConfig,
  // custom
  {
    ignores: ['node_modules/*', 'dist/**/*'],
  },
  {
    files: ['src/**/*.ts'],
    langageOptions: {
      globals: {
        APPS_CONFIG: 'readonly',
      },
    },
  },
];
