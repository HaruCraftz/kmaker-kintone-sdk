import webpack, { type Configuration } from "webpack";
import { getWebpackConfig } from "./webpack.config.js";

export const buildWithWebpack = async (props: {
  env: Kcmaker.EnvironmentValue;
  mode: Kcmaker.BuildMode;
  outDir?: string;
}) => {
  console.log("🚀 Building with Webpack...");

  try {
    const { env, mode, outDir = "dist" } = props;
    const config = getWebpackConfig({ env, mode, outDir });

    await new Promise<webpack.Stats>((resolve, reject) => {
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
};
