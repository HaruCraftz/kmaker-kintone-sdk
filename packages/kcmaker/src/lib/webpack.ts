import path from "path";
import webpack, { type Configuration } from "webpack";
import { loadAppsConfig } from "./app-config.js";

async function loadWebpackConfig(options: { mode: Kcmaker.BuildMode; outDir: string; appsConfig: Kcmaker.AppsConfig }) {
  const configPath = path.resolve(process.cwd(), "webpack.config.js");
  const configModule = await import(configPath);
  return configModule.default(options);
}

export async function buildWithWebpack(params: {
  env: Kcmaker.EnvironmentValue;
  mode: Kcmaker.BuildMode;
  outDir?: string;
}) {
  console.log("🚀 Building with Webpack...");

  try {
    const { env, mode, outDir = "dist" } = params;

    // アプリ設定情報読み込み
    const appsConfig = await loadAppsConfig(env);

    // webpack設定読み込み
    const config: Configuration = await loadWebpackConfig({ mode, outDir, appsConfig });

    // webpack の設定ファイルに型アサーションを行います
    const compiler = webpack(config as Configuration);

    compiler.run((err, stats?) => {
      if (err) {
        console.error("A fatal error occurred during webpack execution:");
        console.error(err);
        process.exit(1);
      }

      if (stats) {
        const info = stats.toJson();

        // コンパイルエラーの表示
        if (stats.hasErrors()) {
          console.error("Webpack compilation errors:\n" + info.errors?.map((e) => e.message || e).join("\n"));
        }

        // コンパイル警告の表示
        if (stats.hasWarnings()) {
          console.warn("Webpack compilation warnings:\n" + info.warnings?.map((w) => w.message || w).join("\n"));
        }

        // ビルド完了メッセージの表示
        console.log("✅ Webpack build completed successfully.");
        console.log(
          stats.toString({
            colors: true, // カラー出力を有効化
            modules: false, // モジュール情報を非表示
            children: false, // 子コンパイラ情報を非表示
            chunks: false, // チャンク情報を非表示
            chunkModules: false, // チャンクモジュール情報を非表示
          }),
        );
      }
    });
  } catch (error) {
    console.error("Webpack build failed:", error);
    throw error;
  }
}
