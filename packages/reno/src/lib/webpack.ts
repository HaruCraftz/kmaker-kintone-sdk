import webpack, { type Configuration } from "webpack";
import { getWebpackConfig } from "./webpack.config.js";

export const buildWithWebpack = async (props: { mode: Configuration["mode"]; outDir: string }) => {
  try {
    const { mode, outDir } = props;
    const config = await getWebpackConfig({ mode, outDir });

    console.log("🚀 Building with Webpack...");

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
        resolve(stats as webpack.Stats);
      });
    });
  } catch (error) {
    console.error("Webpack build failed:", error);
    throw error;
  }
};
