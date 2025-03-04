import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getSubdirectoryNames } from "../lib/sub-directory.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { generateTypeDefinitionsForApp } from "./dts-base.js";

type Answers = {
  env: reno.EnvironmentValue;
  appName: string;
};

export default function command() {
  program
    .command("dts")
    .description("Generate type definitions for Kintone app.")
    .option("-p, --proxy", "proxy")
    .action(action);
}

async function action(options: { proxy: boolean }) {
  try {
    const cwd = process.cwd();
    const appsDir = path.join(cwd, "src", "apps");

    if (!(await fs.pathExists(appsDir))) {
      throw new Error(`Required directory not found:\n${appsDir}`);
    }

    // apps 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(appsDir);

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
        message: "取得先のプロファイルを選択してください:",
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

    // ユーザーから入力を取得
    const { env, appName }: Answers = await prompts(questions);
    console.log(""); // prompts後の改行

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    // "ALL" 選択時は全アプリに対して順次実行、個別選択時は選択アプリのみ実行
    if (appName === "ALL") {
      for (const appName of appNames) {
        try {
          await generateTypeDefinitionsForApp(appsDir, appName, appsConfig, profiles[env], options.proxy);
        } catch (err: any) {
          console.error(`Error processing app "${appName}": ${err.message}`);
        }
      }
    } else {
      await generateTypeDefinitionsForApp(appsDir, appName, appsConfig, profiles[env], options.proxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
