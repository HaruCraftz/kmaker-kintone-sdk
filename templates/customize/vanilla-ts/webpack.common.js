import { fileURLToPath } from 'url';
import path from 'path';
import fg from 'fast-glob';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import appConfig from './config/loader.js';

export default {
  entry: async () => {
    const baseDir = path.posix.join(process.cwd(), 'src', 'apps');
    const files = await fg('**/{desktop,mobile}/index.ts', { cwd: baseDir });
    return Object.fromEntries(
      files.map((file) => {
        const [appName, platform] = path.dirname(file).split(path.posix.sep);
        return [`${appName}/customize.${platform}`, path.posix.join(baseDir, file)];
      })
    );
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'config': path.resolve(process.cwd(), 'config'),
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'CONFIG_APP': JSON.stringify(appConfig),
    }),
  ],
};
