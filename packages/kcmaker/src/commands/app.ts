// src/commands/app.ts
import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { loadProfiles } from "../lib/profile.js";
import { getAppsConfigPath, getDefaultAppConfig, saveAppConfig } from "../lib/app-config.js";

type Answers = {
  env: Kcmaker.EnvironmentValue;
  appName: string;
  appId: number;
};

export default function command() {
  program.command("app").description("create a new application configuration.").action(action);
}

async function action() {
  try {
    const profiles = await loadProfiles();

    // ユーザーからアプリ情報の入力を取得
    const { env, appName, appId }: Answers = await prompts(
      [
        {
          type: "select",
          name: "env",
          message: "対象のプロファイルを選択してください:",
          choices: Object.values(profiles).map((profile: Kcmaker.Profile) => ({
            title: profile.env,
            value: profile.env,
          })),
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
      ],
      {
        onCancel: () => {
          console.log("Operation canceled.");
          process.exit(0);
        },
      },
    );
    console.log(""); // prompts 後に改行

    const cwd = process.cwd();
    const appsDir = path.join(cwd, "src", "apps");
    const appTemplateDir = path.join(cwd, "templates", "app");

    // パッケージ内のアプリテンプレートディレクトリからコピー
    await fs.ensureDir(appsDir);

    // 新しいアプリ作業ディレクトリの出力先
    const appOutputDir = path.join(appsDir, appName);
    const appOutputDirExists = await fs.pathExists(appOutputDir);

    if (!appOutputDirExists) {
      await fs.copy(appTemplateDir, appOutputDir);
      console.log(`The directory '${appName}' has been created.`);
    } else {
      console.log(`The directory '${appName}' already exists.`);
    }

    // アプリの設定ファイルパスを取得
    const appsConfigPath = getAppsConfigPath(env);

    // アプリの初期設定情報を取得
    const newAppConfig = getDefaultAppConfig(appId);

    // アプリ設定を保存
    await saveAppConfig(appsConfigPath, appName, newAppConfig);
    console.log(`Configuration for app '${appName}' has been saved.`);
  } catch (error: any) {
    console.error(`Unexpected error: \n${error.message}`);
    process.exit(1);
  }
}
