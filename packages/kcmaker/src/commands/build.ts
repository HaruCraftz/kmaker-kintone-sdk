import { program, Option } from "commander";
import { buildWithWebpack } from "../lib/webpack.js";
import { ENVIRONMENTS } from "../constants/env.js";
import { loadAppsConfig } from "../lib/app-config.js";

export default function command() {
  program
    .command("build")
    .description("build the project for production.")
    .option("--config <config>", "webpack config file.", "webpack.config.js")
    .addOption(
      new Option("-e, --env <env>", "target environment.").choices(Object.keys(ENVIRONMENTS)).default("development"),
    )
    .addOption(
      new Option("-m, --mode <mode>", "build mode.").choices(["development", "production"]).default("development"),
    )
    .action(action);
}

export async function action(options: { config: string; env: Kcmaker.EnvironmentValue; mode: Kcmaker.BuildMode }) {
  const { config, env, mode } = options;
  const appsConfig = await loadAppsConfig(env);
  await buildWithWebpack(mode, config, appsConfig);
}
