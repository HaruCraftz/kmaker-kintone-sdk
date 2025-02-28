import { program, Option } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { fileURLToPath } from "url";
import { runCommand } from "../lib/command-runner.js";
import { getSubdirectoryNames } from "../lib/subDirectories.js";
import { ENVIRONMENTS } from "../constants/env.js";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { APPS_FILE_NAME, PROFILES_FILE_NAME } from "../constants/fileName.js";

type Answers = {
  profile: reno.EnvironmentValue;
  appName: string;
};

export default function command() {
  program
    .command("launch")
    .description("Create a new application configuration")
    .option("-p, --proxy", "proxy")
    .action(action);
}

/**
 * customize-manifest.json を更新する
 * アセット情報とアプリ設定をマージして上書きする
 * @param {string} manifestPath - manifest ファイルのパス
 * @param {Object} appConfig - 対象アプリの設定情報
 */
async function updateManifest(manifestPath, appConfig) {
  try {
    const manifest = await fs.readJson(manifestPath);
    manifest.app = appConfig.appId;
    const mergedManifest = { ...manifest, ...appConfig.cdn };
    await fs.writeJson(manifestPath, mergedManifest, { spaces: 2 });
  } catch (error) {
    throw new Error(`Error updating manifest file: ${error.message}`);
  }
}

/**
 * 指定アプリフォルダに対して manifest の更新とアップロード処理を実行する
 * @param {string} rootDirectory - ルートディレクトリ
 * @param {string} appName - アプリフォルダ名
 * @param {Object} credentials - 認証情報（baseUrl, proxy, username, password）
 * @param {Object} appsConfig - アプリ設定情報
 * @param {boolean} useProxy - プロキシ使用の有無
 */
async function uploadAppCustomization(rootDirectory, appName, credentials, appsConfig, useProxy) {
  const { baseUrl, proxy, username, password } = credentials;
  const appConfig = appsConfig[appName];

  if (!appConfig) {
    throw new Error(`Configuration for app "${appName}" not found.`);
  }

  const manifestPath = path.join(rootDirectory, "customize-manifest.json");
  await updateManifest(manifestPath, appConfig);

  const args: string[] = ["--base-url", baseUrl, "--username", username, "--password", password, manifestPath];

  if (useProxy) {
    if (!proxy) {
      throw new Error("Proxy mode is enabled, but no proxy configuration was found.");
    }
    args.push("--proxy", proxy);
  }

  console.log(`\n🚀 Uploading customizations for app: "${appName}"...`);
  await runCommand("kintone-customize-uploader", args);

  console.log(`✅ Upload completed successfully for app: "${appName}"`);
}

async function action(options: { proxy: boolean }) {
  try {
    const cwd = process.cwd();

    // ディレクトリパス
    const configDir = path.join(cwd, CONFIG_DIRECTORY);
    const distDir = path.join(cwd, "dist");

    // ファイルパス
    const profilesPath = path.join(configDir, PROFILES_FILE_NAME);

    if (!(await fs.pathExists(distDir))) {
      throw new Error(`Required directory not found: ${distDir}`);
    }

    if (!(await fs.pathExists(profilesPath))) {
      throw new Error('Please run command "npm run setup" first.');
    }

    // dist 内のサブディレクトリを取得
    const appNames = await getSubdirectoryNames(distDir);
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

    // ユーザー入力の取得
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

    // "ALL" 選択時は全アプリ、個別選択時は対象アプリのみ処理
    if (appName === "ALL") {
      for (const appName of appNames) {
        try {
          await uploadAppCustomization(rootDirectory, appName, profiles[profile], appsConfig, options.proxy);
        } catch (err: any) {
          console.error(`Error processing folder ${appName}: ${err.message}`);
        }
      }
    } else {
      await uploadAppCustomization(rootDirectory, appName, profiles[profile], appsConfig, options.proxy);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
