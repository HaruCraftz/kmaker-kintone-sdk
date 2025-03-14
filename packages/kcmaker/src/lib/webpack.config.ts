import webpack, { type Configuration } from "webpack";
import { merge } from "webpack-merge";
import path from "path";
import fs from "fs-extra";
import fg from "fast-glob";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { getAppsConfigPath } from "./app-config.js";

export const getWebpackConfig = (props: { env: Kcmaker.EnvironmentValue; mode: Kcmaker.BuildMode; outDir: string }) => {
  const { env, mode, outDir } = props;

  // パス
  const cwd = process.cwd();

  // エントリーポイント
  const entryPath = "**/{desktop,mobile}/index.{ts,js}";
  const baseDir = path.posix.join(cwd, "src", "apps");
  const files = fg.sync(entryPath, { cwd: baseDir }); // パス検索
  const entries = Object.fromEntries(
    files.map((file) => {
      const [appName, platform] = path.dirname(file).split(path.posix.sep);
      return [`${appName}/customize.${platform}`, path.posix.join(baseDir, file)];
    }),
  );

  // コンフィグ
  const resolveAlias: { plugins?: TsconfigPathsPlugin[]; alias?: Record<string, string> } = {};
  const rules: { test: RegExp; exclude?: RegExp; loader?: string }[] = [];

  // tsconfigの有無でコンフィグを分ける
  const tsConfigPath = fg.sync("tsconfig.*", { cwd });

  if (tsConfigPath.length > 0) {
    resolveAlias.plugins = [
      new TsconfigPathsPlugin({
        configFile: "tsconfig.json",
      }),
    ];
    rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: "ts-loader",
    });
  } else {
    resolveAlias.alias = {
      "@*": path.resolve(cwd, "src/*"),
      Config: path.resolve(cwd, "config"),
    };
    rules.push({
      test: /\.jsx?$/,
      exclude: /node_modules/,
    });
  }

  // plugins
  const styleLoader = MiniCssExtractPlugin.loader;
  const plugins: Configuration["plugins"] = [];

  // アプリ設定情報読み込み
  const appsConfigPath = getAppsConfigPath(env);
  const appsConfig = fs.readJSONSync(appsConfigPath);

  if (appsConfig) {
    plugins.push(
      new webpack.DefinePlugin({
        APPS_CONFIG: JSON.stringify(appsConfig),
      }),
    );
  }

  // webpack共通設定
  const commonConfig: Configuration = {
    mode,
    target: ["web", "es2023"],
    entry: entries,
    output: {
      filename: "[name].js",
      path: path.resolve(cwd, outDir),
    },
    cache: {
      type: "filesystem",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", "jsx", ".json"],
      ...resolveAlias,
    },
    module: {
      rules: [
        ...rules,
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            styleLoader,
            "css-loader",
            {
              loader: "sass-loader",
              options: { sassOptions: { outputStyle: "expanded" } },
            },
          ],
        },
      ],
    },
    plugins: [
      //
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: "[name].css" }),
      ...plugins,
    ],
  };

  // webpack環境別設定
  const prodConfig: Configuration = {
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
  const devConfig: Configuration = {
    devtool: "inline-source-map",
  };

  if (mode === "production") {
    return merge(commonConfig, prodConfig);
  } else if (mode === "development") {
    return merge(commonConfig, devConfig);
  } else {
    throw new Error(`Invalid mode: ${mode}`);
  }
};
