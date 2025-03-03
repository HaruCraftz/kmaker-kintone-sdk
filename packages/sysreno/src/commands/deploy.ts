import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getSubdirectoryNames } from "../lib/sub-directory.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { deployAppCustomization } from "./deploy-base.js";

type Answers = {
  env: reno.EnvironmentValue;
  appName: string;
};

export default function command() {
  program
    .command("deploy")
    .description("Deploy kintone customization for each environments.")
    .option("-p, --proxy", "proxy")
    .action(action);
}

async function action(options: { proxy: boolean }) {
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
        name: "env",
        message: "配置先のプロファイルを選択してください:",
        choices: Object.values(profiles).map((profile) => ({ title: profile.env, value: profile.env })),
        initial: 0,
      },
      {
        type: "select",
        name: "appName",
        message: "対象のアプリフォルダを選択してください:",
        choices: appChoices,
        initial: 0,
      },
    ];

    // ユーザー入力の取得
    const { env, appName }: Answers = await prompts(questions);
    console.log(""); // prompts後の改行

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    // "ALL" 選択時は全アプリ、個別選択時は対象アプリのみ処理
    if (appName === "ALL") {
      for (const appName of appNames) {
        try {
          await deployAppCustomization(appName, appsConfig, profiles[env], options.proxy);
        } catch (err: any) {
          console.error(`Error processing folder ${appName}: ${err.message}`);
        }
      }
    } else {
      await deployAppCustomization(appName, appsConfig, profiles[env], options.proxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
