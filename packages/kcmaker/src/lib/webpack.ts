import path from "path";
import webpack, { type Configuration } from "webpack";
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

    await new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats?.hasErrors()) {
          const errors = stats.compilation.errors.map((error) => error.message);
          return reject(new Error(errors.join("\n")));
        }
        if (stats?.hasWarnings()) {
          const warnings = stats.compilation.warnings.map((warning) => warning.message);
          console.warn("Webpack warnings:", warnings.join("\n"));
        }
        console.log("✅ Webpack build completed.");
        resolve(stats as webpack.Stats);
      });
    });
  } catch (error) {
    console.error("Webpack build failed:", error);
    throw error;
  }
}
