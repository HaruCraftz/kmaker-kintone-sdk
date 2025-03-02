import { DefinePlugin, type Configuration } from "webpack";
import { merge } from "webpack-merge";
import path from "path";
import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import appsConfig from "./loader.js";

export const getWebpackConfig = async (props: {
  mode: Configuration["mode"];
  entries: Configuration["entry"];
  outDir: string;
}) => {
  const { mode, entries, outDir } = props;
  const cwd = process.cwd();
  const tsConfigPath = path.join(cwd, "tsconfig.json");
  const styleLoader = MiniCssExtractPlugin.loader;

  const resolveAlias: {
    plugins?: TsconfigPathsPlugin[];
    alias?: Record<string, string>;
  } = {};
  const rules: { test: RegExp; exclude: RegExp; loader?: string }[] = [];

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

  const commonConfig: Configuration = {
    mode,
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
      new CleanWebpackPlugin(),
      new DefinePlugin({ APPS_CONFIG: JSON.stringify(appsConfig) }),
      new MiniCssExtractPlugin({ filename: "[name].css" }),
    ],
  };

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
  }

  return merge(commonConfig, devConfig);
};
