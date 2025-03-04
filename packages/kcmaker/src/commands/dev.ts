import { program } from "commander";
import path from "path";
import { buildWithWebpack } from "../lib/webpack.js";

export default function command() {
  program
    .command("dev")
    .description("Build the project for development.")
    .option("-o, --outdir <outdir>", "Output directory.", "dist")
    .action(action);
}

export async function action(options: { outdir: string }) {
  const outDir = path.posix.join(process.cwd(), options.outdir);
  await buildWithWebpack({ mode: "development", outDir });
}
