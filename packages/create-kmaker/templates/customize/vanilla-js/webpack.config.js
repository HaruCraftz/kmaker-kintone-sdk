import path from 'path';
import fg from 'fast-glob';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';

export default function getWebpackConfig(props) {
  const { mode, outDir, appsConfig } = props;
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

  // webpack共通設定
  const commonConfig = {
    mode,
    target: ['web', 'es2023'],
    entry: entries,
    output: {
      filename: '[name].js',
      path: path.resolve(cwd, outDir),
    },
    cache: {
      type: 'filesystem',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', 'jsx', '.json'],
      alias: {
        '@*': path.resolve(cwd, 'src/*'),
        Config: path.resolve(cwd, 'config'),
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/i,
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i, // .css ファイルを対象
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i, // .scss または .sass を対象
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
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new webpack.DefinePlugin({
        APPS_CONFIG: JSON.stringify(appsConfig),
      }),
    ],
  };

  // webpack環境別設定
  const prodConfig = {
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: { format: { comments: false } },
          extractComments: false,
        }),
      ],
    },
  };

  const devConfig = {
    devtool: 'inline-source-map',
  };

  if (mode === 'production') {
    return merge(commonConfig, prodConfig);
  } else if (mode === 'development') {
    return merge(commonConfig, devConfig);
  }

  throw new Error(`Invalid mode: ${mode}`);
}
