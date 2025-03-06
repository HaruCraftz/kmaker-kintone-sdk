import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getSubdirectoryNames } from "../lib/sub-directory.js";
import { loadAppsConfig } from "../lib/app-config.js";
import { generateTypeDefinitionsForApp } from "./dts-base.js";

type Answers = {
  env: Kcmaker.EnvironmentValue;
  appName?: string;
};

export default function command() {
  program
    .command("dts")
    .description("generate type definitions for Kintone app.")
    .option("--all", "deploy all apps.")
    .option("--proxy", "execute with proxy.")
    .action(action);
}

async function action(options: { all?: boolean; proxy?: boolean }) {
  try {
    const cwd = process.cwd();
    const appsDir = path.join(cwd, "src", "apps");

    if (!(await fs.pathExists(appsDir))) {
      throw new Error(`Required directory not found:\n${appsDir}`);
    }

    // apps 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(appsDir);

    const profiles = await loadProfiles();

    const questions: {
      type: "select" | "multiselect";
      name: "env" | "appName";
      message: string;
      choices?: { title: string; value: string }[];
      initial?: number;
      hint?: string;
    }[] = [
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
        name: "appName",
        message: "対象のアプリフォルダを選択してください:",
        choices: appNames.map((name) => ({ title: name, value: name })),
        initial: 0,
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
    const app = options.all ? "ALL" : answers.appName!;
    const useProxy = Boolean(options.proxy);

    // アプリの設定情報を読み込む
    const appsConfig = await loadAppsConfig(env);

    // "ALL" 選択時は全アプリに対して順次実行、個別選択時は選択アプリのみ実行
    if (app === "ALL") {
      for (const appName of appNames) {
        try {
          await generateTypeDefinitionsForApp(appsDir, appName, appsConfig, profiles[env], useProxy);
        } catch (err: any) {
          console.error(`Error processing app "${appName}": ${err.message}`);
        }
      }
    } else {
      await generateTypeDefinitionsForApp(appsDir, app, appsConfig, profiles[env], useProxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: \n${error.message}`);
    process.exit(1);
  }
}
