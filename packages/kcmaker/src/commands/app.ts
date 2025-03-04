// src/commands/app.ts
import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { getTemplatesDir } from "../lib/path.js";
import { loadProfiles } from "../lib/profile.js";
import { getAppsConfigPath, getDefaultAppConfig, saveAppConfig } from "../lib/app-config.js";

type Answers = {
  env: reno.EnvironmentValue;
  appName: string;
  appId: number;
};

export default function command() {
  program.command("app").description("Create a new application configuration.").action(action);
}

async function action() {
  try {
    const cwd = process.cwd();
    const appsDir = path.join(cwd, "src", "apps");

    const templatesDir = getTemplatesDir();
    const appTemplateDir = path.join(templatesDir, "app");

    const profiles = await loadProfiles();

    // ユーザーからアプリ情報の入力を取得
    const { env, appName, appId }: Answers = await prompts([
      {
        type: "select",
        name: "env",
        message: "取得先のプロファイルを選択してください:",
        choices: Object.values(profiles).map((profile: reno.Profile) => ({ title: profile.env, value: profile.env })),
      },
      {
        type: "text",
        name: "appName",
        message: "開発するアプリ名を入力してください:",
        validate: (input) => (input.trim() !== "" ? true : "アプリ名を入力してください"),
      },
      {
        type: "number",
        name: "appId",
        message: "開発環境のアプリIDを入力してください:",
        style: "default",
        validate: (input) => (input !== "" ? true : "アプリIDを入力してください"),
      },
    ]);
    console.log(""); // prompts 後に改行

    // 新しいアプリ作業ディレクトリの出力先
    const appOutputDir = path.join(appsDir, appName);

    if (await fs.pathExists(appOutputDir)) {
      console.error(`The directory '${appName}' already exists.`);
      process.exit(1);
    }

    // パッケージ内のアプリテンプレートディレクトリからコピー
    await fs.ensureDir(appsDir);
    await fs.copy(appTemplateDir, appOutputDir);

    // アプリの設定ファイルパスを取得
    const appsConfigPath = getAppsConfigPath(env);

    // アプリの初期設定情報を取得
    const appConfig = getDefaultAppConfig(appId);

    // アプリ設定を保存
    await saveAppConfig(appsConfigPath, appName, appConfig);
    console.log(`The folder '${appName}' has been created!`);
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
