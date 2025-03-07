import { program, Option } from "commander";
import { buildWithWebpack } from "../lib/webpack.js";
import { ENVIRONMENTS } from "../constants/env.js";

export default function command() {
  program
    .command("build")
    .description("build the project for production.")
    .option("-o, --outdir <outdir>", "output directory.", "dist")
    .addOption(
      new Option("-e, --env <env>", "target environment.").choices(Object.keys(ENVIRONMENTS)).default("development"),
    )
    .addOption(
      new Option("-m, --mode <mode>", "build mode.").choices(["development", "production"]).default("development"),
    )
    .action(action);
}

export async function action(options: { env: Kcmaker.EnvironmentValue; mode: Kcmaker.BuildMode; outdir: string }) {
  const { env, mode, outdir: outDir } = options;
  await buildWithWebpack({ env, mode, outDir });
}
