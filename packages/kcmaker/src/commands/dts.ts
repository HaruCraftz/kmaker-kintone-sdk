import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts, { type PromptObject } from "prompts";
import { getSubdirectoryNames } from "../lib/directory.js";
import { loadProfiles } from "../lib/profile.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { generateTypeDefinitionsForApp } from "./dts-base.js";

type Answers = {
  env: Kcmaker.EnvironmentValue;
  appNames?: Array<string>;
};

export default function command() {
  program
    .command("dts")
    .description("generate type definitions for Kintone app.")
    .option("--all", "deploy all apps.", false)
    .option("--proxy", "execute with proxy.", false)
    .action(action);
}

async function action(options: { all: boolean; proxy: boolean }) {
  try {
    const cwd = process.cwd();
    const appsDir = path.join(cwd, "src", "apps");

    if (!(await fs.pathExists(appsDir))) {
      throw new Error(`Required directory not found:\n${appsDir}`);
    }

    // apps 内のサブディレクトリを取得
    const appDirNames = await getSubdirectoryNames(appsDir);

    const profiles = await loadProfiles();

    const questions: PromptObject<keyof Answers>[] = [
      {
        type: "select",
        name: "env",
        message: "取得先のプロファイルを選択してください:",
        choices: Object.values(profiles).map((profile) => ({ title: profile.env, value: profile.env })),
        initial: 0,
      },
    ];

    if (!options.all) {
      questions.push({
        type: "multiselect",
        name: "appNames",
        message: "対象のアプリフォルダを選択してください:",
        instructions: false,
        choices: appDirNames.map((name) => ({ title: name, value: name })),
        min: 1,
        hint: "- Space to select. Return to submit",
      });
    }

    // ユーザーから入力を取得
    const answers: Answers = await prompts(questions, {
      onCancel: () => {
        console.log("Operation canceled.");
        process.exit(0);
      },
    });
    console.log(""); // prompts後の改行

    const env = answers.env;
    const appNames = options.all ? appDirNames : answers.appNames!;
    const useProxy = Boolean(options.proxy);

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    // "ALL" 選択時は全アプリに対して順次実行、個別選択時は選択アプリのみ実行
    for (const appName of appNames) {
      try {
        console.log(`\n🔧 Generating type definitions for "${appName}"...`);
        await generateTypeDefinitionsForApp(appsDir, appName, appsConfig, profiles[env], useProxy);
        console.log("✅ Type definitions have been generated.");
      } catch (err: any) {
        console.error(`Error processing app "${appName}": ${err.message}`);
      }
    }
  } catch (error: any) {
    console.error(`Unexpected error: \n${error.message}`);
    process.exit(1);
  }
}
