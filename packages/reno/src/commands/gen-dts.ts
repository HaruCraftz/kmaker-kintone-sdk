import { program, Option } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { APPS_FILE_NAME, PROFILES_FILE_NAME } from "../constants/fileName.js";
import { getSubdirectoryNames } from "../lib/subDirectories.js";
import { generateTypeDefinitionsForApp } from "./gen-dts-base.js";

type Answers = {
  profile: reno.EnvironmentValue;
  appName: string;
};

export default function command() {
  program
    .command("type")
    .description("Generate type definitions for Kintone app")
    .option("-p, --proxy", "proxy")
    .action(action);
}

async function action(options: { proxy: boolean }) {
  try {
    const cwd = process.cwd();

    // ディレクトリパス
    const configDir = path.join(cwd, CONFIG_DIRECTORY);
    const appsDir = path.join(cwd, "src", "apps");

    // ファイルパス
    const profilesPath = path.join(configDir, PROFILES_FILE_NAME);

    if (!(await fs.pathExists(appsDir))) {
      throw new Error(`Required directory not found:\n${appsDir}`);
    }

    if (!(await fs.pathExists(profilesPath))) {
      throw new Error('Please run command "npm run setup" first.');
    }

    // apps 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(appsDir);
    let appChoices = appNames.map((folder) => ({ title: folder, value: folder }));
    if (appChoices.length > 1) {
      appChoices = [{ title: "ALL", value: "ALL" }, ...appChoices];
    }

    // プロファイル情報を読み込む
    const profiles: reno.Profiles = await fs.readJson(profilesPath);

    const questions: {
      type: "select";
      name: "profile" | "appName";
      message: string;
      choices?: { title: string; value: string }[];
      initial?: number;
    }[] = [
      {
        type: "select",
        name: "profile",
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
    const { profile, appName }: Answers = await prompts(questions);
    console.log(""); // prompts後の改行

    // アプリ設定ファイル名
    const [fileName, ext] = APPS_FILE_NAME.split(".");
    const appsFileName = `${fileName}.${profile}.${ext}`;

    // 設定ファイルの存在確認
    const appsPath = path.join(configDir, appsFileName);

    if (!(await fs.pathExists(appsPath))) {
      throw new Error('Please run command "npm run app" first.');
    }

    // アプリの設定情報を読み込む
    const appsConfig: reno.AppConfig = await fs.readJson(appsPath);

    // "ALL" 選択時は全アプリに対して順次実行、個別選択時は選択アプリのみ実行
    if (appName === "ALL") {
      for (const appName of appNames) {
        try {
          await generateTypeDefinitionsForApp(appsDir, appName, profiles[profile], appsConfig, options.proxy);
        } catch (err: any) {
          console.error(`Error processing app "${appName}": ${err.message}`);
        }
      }
    } else {
      await generateTypeDefinitionsForApp(appsDir, appName, profiles[profile], appsConfig, options.proxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
