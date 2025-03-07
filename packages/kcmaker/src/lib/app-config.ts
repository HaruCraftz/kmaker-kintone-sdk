import fs from "fs-extra";
import path from "path";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { APPS_FILE_NAME } from "../constants/fileName.js";
import { ENVIRONMENTS } from "../constants/env.js";

/**
 * 初期のアプリ設定情報を作成する関数
 * @param appId アプリID
 * @returns 初期のアプリ設定情報
 */
export function getDefaultAppConfig(appId: number): Kcmaker.AppConfig {
  return {
    appId,
    apiTokens: {},
    viewId: {},
    cdn: {
      desktop: {
        js: [],
        css: [],
      },
      mobile: {
        js: [],
      },
    },
  };
}

/**
 * 設定ファイルを作成または更新する関数
 * @param appsConfigPath アプリ設定ファイルのパス
 * @param appName アプリケーション名
 * @param newAppConfig 新しいアプリケーション設定情報
 */
export async function saveAppConfig(
  appsConfigPath: string,
  appName: string,
  newAppConfig: Kcmaker.AppConfig,
): Promise<void> {
  try {
    let config: Record<string, Kcmaker.AppConfig> = {};
    if (await fs.pathExists(appsConfigPath)) {
      config = await fs.readJson(appsConfigPath);
    }
    config[appName] = newAppConfig;
    await fs.writeJson(appsConfigPath, config, { spaces: 2 });
  } catch (error: any) {
    throw new Error(`Error saving app config: ${error.message}`);
  }
}

export function getAppsConfigPath(env: Kcmaker.EnvironmentValue) {
  const cwd = process.cwd();
  const configDir = path.join(cwd, CONFIG_DIRECTORY);
  const [fileName, ext] = APPS_FILE_NAME.split(".");
  return path.join(configDir, `${fileName}.${ENVIRONMENTS[env].fileSuffix}.${ext}`);
}

export async function loadAppsConfig(env: Kcmaker.EnvironmentValue): Promise<Kcmaker.AppsConfig> {
  try {
    const appsConfigPath = getAppsConfigPath(env);

    // 設定ファイルの存在確認
    if (!(await fs.pathExists(appsConfigPath))) {
      console.error(`Apps config file not found: \n${appsConfigPath}`);
      process.exit(1);
    }

    // アプリの設定情報を読み込む
    return await fs.readJson(appsConfigPath);
  } catch (error: any) {
    throw new Error(`Error loading apps config: ${error.message}`);
  }
}
