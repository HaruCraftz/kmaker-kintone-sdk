import { program, Option } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getSubdirectoryNames } from "../lib/sub-directory.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { deployAppCustomization } from "./launch-base.js";
import { ENVIRONMENTS } from "../constants/env.js";

type Answers = {
  env: Kcmaker.EnvironmentValue;
  appName: string;
};

export default function command() {
  program
    .command("launch")
    .description("launch kintone customization for each environments.")
    .option("--proxy", "Execute with proxy.")
    .addOption(new Option("-e, --env <env>", "Target environment.").choices(Object.keys(ENVIRONMENTS)))
    .addOption(new Option("-m, --mode <mode>", "Build mode.").choices(["development", "production"]))
    .action(action);
}

async function action(options: { proxy?: boolean; env?: Kcmaker.EnvironmentValue; mode?: Kcmaker.EnvironmentValue }) {
  try {
    const cwd = process.cwd();
    const distDir = path.join(cwd, "dist");

    if (!(await fs.pathExists(distDir))) {
      throw new Error(`Required directory not found: ${distDir}`);
    }

    // dist 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(distDir);

    // 選択肢作成
    let appChoices = appNames.map((folder) => ({ title: folder, value: folder }));
    if (appChoices.length > 1) {
      appChoices = [{ title: "ALL", value: "ALL" }, ...appChoices];
    }

    const profiles = await loadProfiles();

    const questions: {
      type: "select";
      name: "env" | "appName";
      message: string;
      choices?: { title: string; value: string }[];
      initial?: number;
    }[] = [
      {
        type: "select",
        name: "appName",
        message: "対象のアプリフォルダを選択してください:",
        choices: appChoices,
        initial: 0,
      },
    ];

    if (!options.env) {
      questions.unshift({
        type: "select",
        name: "env",
        message: "デプロイ先のプロファイルを選択してください:",
        choices: Object.values(profiles).map((profile) => ({ title: profile.env, value: profile.env })),
        initial: 0,
      });
    }

    // ユーザー入力の取得
    const { env, appName }: Answers = await prompts(questions);
    console.log(""); // prompts後の改行

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    const useProxy = options.proxy || false;

    // "ALL" 選択時は全アプリ、個別選択時は対象アプリのみ処理
    if (appName === "ALL") {
      for (const appName of appNames) {
        try {
          await deployAppCustomization(appName, appsConfig, profiles[env], useProxy);
        } catch (err: any) {
          console.error(`Error processing folder ${appName}: ${err.message}`);
        }
      }
    } else {
      await deployAppCustomization(appName, appsConfig, profiles[env], useProxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
