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

export const getWebpackConfig = async (props: { mode: Kcmaker.EnvironmentValue; outDir: string }) => {
  const { mode, outDir } = props;
  const webpackMode: Configuration["mode"] = mode === "production" ? mode : "development";

  // パス
  const cwd = process.cwd();
  const tsConfigPath = path.join(cwd, "tsconfig.json");

  // エントリーポイント
  const entryPath = "**/{desktop, mobile}/index.{ts,js}";
  const baseDir = path.posix.join(cwd, "src", "apps");
  const files = await fg(entryPath, { cwd: baseDir }); // パス検索
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
  if (fs.pathExistsSync(tsConfigPath)) {
    resolveAlias.plugins = [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ];
    rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: "ts-loader",
    });
  } else {
    resolveAlias.alias = {
      Config: path.resolve(cwd, "config"),
      "@": path.resolve(cwd, "src"),
      Components: path.resolve(cwd, "src/components"),
      Constants: path.resolve(cwd, "src/constants"),
      Global: path.resolve(cwd, "src/global"),
      Utils: path.resolve(cwd, "src/utils"),
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
  const appsConfigPath = getAppsConfigPath(mode);
  const appsConfig = fs.readJSONSync(appsConfigPath, "utf8");

  if (appsConfig) {
    plugins.push(
      new webpack.DefinePlugin({
        APPS_CONFIG: JSON.stringify(appsConfig),
      }),
    );
  }

  // webpack共通設定
  const commonConfig: Configuration = {
    mode: webpackMode,
    target: ["web", "es2023"],
    entry: entries,
    output: {
      filename: "[name].js",
      path: path.resolve(outDir),
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
