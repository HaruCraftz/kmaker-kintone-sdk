import path from "path";
import webpack, { Compiler, Stats, type Configuration } from "webpack";
import { loadAppsConfig } from "./app-config.js";

async function loadWebpackConfig(options: { mode: Kcmaker.BuildMode; outDir: string; appsConfig: Kcmaker.AppsConfig }) {
  const configPath = path.resolve(process.cwd(), "webpack.config.js");
  const configModule = await import(configPath);
  if (typeof configModule.default === "function") {
    return configModule.default(options);
  }
  return configModule.default;
}

export async function buildWithWebpack(props: {
  env: Kcmaker.EnvironmentValue;
  mode: Kcmaker.BuildMode;
  outDir?: string;
}) {
  console.log("🚀 Building with Webpack...");

  try {
    const { env, mode, outDir = "dist" } = props;

    // アプリ設定情報読み込み
    const appsConfig = await loadAppsConfig(env);

    // webpack設定読み込み
    const config: Configuration = await loadWebpackConfig({ mode, outDir, appsConfig });

    // webpack の設定ファイルに型アサーションを行います
    const compiler: Compiler = webpack(config as Configuration);

    // コマンドライン引数に "--watch" が含まれているかどうかでモードを切り替えます
    const isWatchMode = process.argv.includes("--watch");

    if (isWatchMode) {
      // watch モードの場合
      console.log("Starting webpack in watch mode...");
      compiler.watch(
        {
          // watch オプション（例: aggregateTimeout は変更後に再ビルドするまでの待機時間）
          aggregateTimeout: 300,
          // poll: true, // ポーリングを有効にする場合はコメントアウトを解除してください
        },
        (err: Error | null, stats?: Stats) => {
          if (err) {
            console.error("A fatal error occurred during webpack execution:");
            console.error(err);
            return;
          }

          if (stats) {
            const info = stats.toJson();

            // コンパイルエラーの表示
            if (stats.hasErrors()) {
              console.error("Webpack compilation errors:");
              info.errors.forEach((error) => {
                console.error(error);
              });
            }

            // コンパイル警告の表示
            if (stats.hasWarnings()) {
              console.warn("Webpack compilation warnings:");
              info.warnings.forEach((warning) => {
                console.warn(warning);
              });
            }

            // ビルド完了メッセージの表示
            console.log("Webpack build completed successfully (watch mode).");
            console.log(
              stats.toString({
                colors: true, // カラー出力を有効にする
                modules: false, // モジュール情報を非表示
                children: false, // 子コンパイラ情報を非表示
                chunks: false, // チャンク情報を非表示
                chunkModules: false, // チャンクモジュール情報を非表示
              }),
            );
          }
        },
      );
    } else {
      // 通常ビルドの場合
      console.log("Starting webpack build...");
      compiler.run((err: Error | null, stats?: Stats) => {
        if (err) {
          console.error("A fatal error occurred during webpack execution:");
          console.error(err);
          process.exit(1);
        }

        if (stats) {
          const info = stats.toJson();

          // コンパイルエラーの表示
          if (stats.hasErrors()) {
            console.error("Webpack compilation errors:");
            info.errors.forEach((error) => {
              console.error(error);
            });
          }

          // コンパイル警告の表示
          if (stats.hasWarnings()) {
            console.warn("Webpack compilation warnings:");
            info.warnings.forEach((warning) => {
              console.warn(warning);
            });
          }

          // ビルド完了メッセージの表示
          console.log("Webpack build completed successfully.");
          console.log(
            stats.toString({
              colors: true, // カラー出力を有効にする
              modules: false, // モジュール情報を非表示
              children: false, // 子コンパイラ情報を非表示
              chunks: false, // チャンク情報を非表示
              chunkModules: false, // チャンクモジュール情報を非表示
            }),
          );
        }
      });
    }
  } catch (error) {
    console.error("Webpack build failed:", error);
    throw error;
  }
}
