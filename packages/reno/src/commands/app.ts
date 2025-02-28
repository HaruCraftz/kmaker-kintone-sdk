// src/commands/app.ts
import { program } from "commander";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { PROFILES_FILE_NAME, APPS_FILE_NAME } from "../constants/fileName.js";
import { getDefaultAppConfig, saveAppConfigFile } from "../lib/appConfig.js";

type Answers = {
  profile: reno.EnvironmentValue;
  appName: string;
  appId: number;
};

export default function command() {
  program.command("app").description("Create a new application configuration").action(action);
}

async function action() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatesDir = path.join(__dirname, "..", "templates");

    const cwd = process.cwd();
    const configDir = path.join(cwd, CONFIG_DIRECTORY);
    const appsDir = path.join(cwd, "src", "apps");
    const profilesPath = path.join(configDir, PROFILES_FILE_NAME);

    if (!(await fs.pathExists(profilesPath))) {
      console.error('Please run command "npm run profile" first.');
      process.exit(1);
    }

    const profiles: reno.Profiles = await fs.readJSON(profilesPath);

    // ユーザーからアプリ情報の入力を取得
    const { profile, appName, appId }: Answers = await prompts([
      {
        type: "select",
        name: "profile",
        message: "プロファイルを選択してください:",
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

    await fs.ensureDir(appsDir);

    // 新しいアプリの出力先ディレクトリ
    const appOutputDir = path.join(appsDir, appName);

    if (await fs.pathExists(appOutputDir)) {
      console.error(`The directory '${appName}' already exists.`);
      process.exit(1);
    }

    // パッケージ内のアプリテンプレートディレクトリからコピー
    const appTemplateDir = path.join(templatesDir, "app");
    await fs.copy(appTemplateDir, appOutputDir);

    // アプリ設定を保存
    const [fileName, ext] = APPS_FILE_NAME.split(".");
    const appsPath = path.join(configDir, `${fileName}.${profile}.${ext}`);

    // アプリの初期設定情報を取得
    const appConfig = getDefaultAppConfig(appId);

    await saveAppConfigFile(appsPath, appName, appConfig);
    console.log(`The folder '${appName}' has been created!`);
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
