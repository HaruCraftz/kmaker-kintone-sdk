import { program, Option } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getSubdirectoryNames } from "../lib/sub-directory.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { deployAppCustomization } from "./launch-base.js";
import { ENVIRONMENTS } from "../constants/env.js";
import { buildWithWebpack } from "../lib/webpack.js";

type Answers = {
  mode?: Kcmaker.BuildMode;
  env?: Kcmaker.EnvironmentValue;
  appName?: string;
};

export default function command() {
  program
    .command("launch")
    .description("launch kintone customization for each environments.")
    .option("--all", "deploy all apps.")
    .option("--proxy", "execute with proxy.")
    .addOption(new Option("-m, --mode <mode>", "build mode.").choices(["development", "production"]))
    .addOption(new Option("-e, --env <env>", "target environment.").choices(Object.keys(ENVIRONMENTS)))
    .action(action);
}

async function action(options: {
  all?: boolean;
  proxy?: boolean;
  mode?: Kcmaker.BuildMode;
  env?: Kcmaker.EnvironmentValue;
}) {
  try {
    const cwd = process.cwd();
    const distDir = path.join(cwd, "dist");

    if (!(await fs.pathExists(distDir))) {
      throw new Error(`Required directory not found: ${distDir}`);
    }

    // dist 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(distDir);

    const profiles = await loadProfiles();

    const questions: {
      type: "select" | "multiselect";
      name: "env" | "mode" | "appName";
      message: string;
      choices?: { title: string; value: string }[];
      initial?: number;
      hint?: string;
    }[] = [];

    if (!options.mode) {
      questions.push({
        type: "select",
        name: "mode",
        message: "ビルド形式を選択してください:",
        choices: ["development", "production"].map((mode) => ({ title: mode, value: mode })),
        initial: 0,
      });
    }

    if (!options.env) {
      questions.push({
        type: "select",
        name: "env",
        message: "デプロイ先のプロファイルを選択してください:",
        choices: Object.values(profiles).map((profile) => ({ title: profile.env, value: profile.env })),
        initial: 0,
      });
    }

    if (!options.all) {
      questions.push({
        type: "multiselect",
        name: "appName",
        message: "対象のアプリフォルダを選択してください:",
        choices: appNames.map((name) => ({ title: name, value: name })),
        initial: 0,
        hint: "- Space to select. Return to submit",
      });
    }

    // ユーザー入力の取得
    const answers: Answers = await prompts(questions, {
      onCancel: () => {
        console.log("Operation canceled.");
        process.exit(0);
      },
    });
    console.log(""); // prompts後の改行

    const mode = options.mode || answers.mode!;
    const env = options.env || answers.env!;
    const app = options.all ? "ALL" : answers.appName!;
    const useProxy = Boolean(options.proxy);
    const profile = profiles[env];

    // プロファイルを読み込む
    if (!profile) {
      throw new Error(`Profile for environment "${env}" not found.`);
    }

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    // Webpack
    await buildWithWebpack({ mode });

    // "ALL" 選択時は全アプリ、個別選択時は対象アプリのみ処理
    if (app === "ALL") {
      for (const appName of appNames) {
        try {
          await deployAppCustomization(appName, appsConfig, profile, useProxy);
        } catch (err: any) {
          console.error(`Error processing folder ${appName}: ${err.message}`);
        }
      }
    } else {
      await deployAppCustomization(app, appsConfig, profile, useProxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: \n${error.message}`);
    process.exit(1);
  }
}
