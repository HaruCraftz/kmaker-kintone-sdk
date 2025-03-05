import { program, Option } from "commander";
import path from "path";
import { buildWithWebpack } from "../lib/webpack.js";
import { ENVIRONMENTS } from "../constants/env.js";

export default function command() {
  program
    .command("build")
    .description("build the project for production.")
    .option("-o, --outdir <outdir>", "Output directory.", "dist")
    .addOption(new Option("-m, --mode <mode>", "Build mode.").choices(["development", "production"]))
    .action(action);
}

export async function action(options: { outdir: string; mode: Kcmaker.EnvironmentValue }) {
  const { mode, outdir } = options;
  if (!(mode in ENVIRONMENTS)) {
    console.error(`Invalid mode: ${mode}`);
    program.help();
  }
  const outDir = path.posix.join(process.cwd(), outdir);
  await buildWithWebpack({ mode, outDir });
}
