import path from 'path';
import fg from 'fast-glob';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';

/**
 * @param {string} mode - 'production' | 'development'
 * @returns {import('webpack').Configuration}
 */
export default function getWebpackConfig(mode) {
  const cwd = process.cwd();

  // エントリーポイント
  const entryPath = '**/{desktop,mobile}/index.{ts,js}';
  const baseDir = path.posix.join(cwd, 'src', 'apps');
  const files = fg.sync(entryPath, { cwd: baseDir }); // パス検索
  const entries = Object.fromEntries(
    files.map((file) => {
      const [appName, platform] = path.dirname(file).split(path.posix.sep);
      return [`${appName}/customize.${platform}`, path.posix.join(baseDir, file)];
    })
  );

  /** webpack共通設定 */
  const commonConfig = {
    target: ['web', 'es2023'],
    entry: entries,
    output: {
      filename: '[name].js',
      path: path.resolve(cwd, 'dist'),
    },
    optimization: {
      emitOnErrors: false,
    },
    cache: {
      type: 'filesystem',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: 'tsconfig.json',
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader, // Creates `style` nodes from JS strings
            'css-loader', // Translates CSS into CommonJS
            'sass-loader', // Compiles Sass to CSS
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
  };

  switch (mode) {
    /** webpack環境別設定 - production */
    case 'production':
      return merge(commonConfig, {
        mode: 'production',
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: { format: { comments: false } },
              extractComments: false,
            }),
          ],
        },
      });
    /** webpack環境別設定 - development */
    case 'development':
      return merge(commonConfig, {
        mode: 'development',
        devtool: 'inline-source-map',
      });
    default:
      throw new Error(`Invalid build mode: ${mode}`);
  }
}
