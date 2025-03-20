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
  console.log("🚀 Building with Webpack...\n");

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
      if (!stats) {
        throw new Error("Webpack did not return any stats.");
      }

      console.log(
        stats.toString({
          colors: true, // カラー出力を有効化
          modules: false, // モジュール情報を非表示
          children: false, // 子コンパイラ情報を非表示
          chunks: false, // チャンク情報を非表示
          chunkModules: false, // チャンクモジュール情報を非表示
        }),
      );

      if (stats.hasErrors()) {
        console.error("\n❌ Webpack build failed with errors.");
        process.exit(1);
      }

      if (stats.hasWarnings()) {
        console.error("\n⚠️ Webpack build completed with warnings.");
        process.exit(1);
      }

      console.log("\n✅ Webpack build completed successfully.");
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    throw error;
  }
}
