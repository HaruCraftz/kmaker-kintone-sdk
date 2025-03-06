import { program, Option } from "commander";
import { buildWithWebpack } from "../lib/webpack.js";

export default function command() {
  program
    .command("build")
    .description("build the project for production.")
    .option("-o, --outdir <outdir>", "output directory.", "dist")
    .addOption(
      new Option("-m, --mode <mode>", "build mode.").choices(["development", "production"]).default("development"),
    )
    .action(action);
}

export async function action(options: { mode: Kcmaker.BuildMode; outdir: string }) {
  const { mode, outdir: outDir } = options;
  await buildWithWebpack({ mode, outDir });
}
