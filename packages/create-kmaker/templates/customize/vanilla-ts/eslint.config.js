import cybozuKintoneConfig from '@cybozu/eslint-config/flat/presets/kintone-customize.js';
import cybozuTsConfig from '@cybozu/eslint-config/flat/presets/typescript.js';
import cybozuPretterConfig from '@cybozu/eslint-config/flat/presets/prettier.js';

export default [
  // cybozuConfig
  ...cybozuKintoneConfig,
  ...cybozuTsConfig,
  ...cybozuPretterConfig,
  // custom
  {
    ignores: ['node_modules/*', 'dist/**/*', '**/*.d.ts', 'webpack.*.js'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        APPS_CONFIG: 'readonly',
      },
    },
  },
];
