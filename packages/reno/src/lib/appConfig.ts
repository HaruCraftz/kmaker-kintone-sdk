import fs from "fs-extra";

/**
 * 初期のアプリ設定情報を作成する関数
 * @param appId アプリID
 * @returns 初期のアプリ設定情報
 */
export function getDefaultAppConfig(appId: number): reno.AppConfig {
  return {
    appId,
    apiTokens: {},
    viewId: {},
    cdn: {
      scope: "ALL",
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
 * @param appsPath アプリ設定ファイルのパス
 * @param appName アプリケーション名
 * @param appConfig アプリケーション設定情報
 */
export async function saveAppConfigFile(appsPath: string, appName: string, appConfig: reno.AppConfig): Promise<void> {
  try {
    let config: Record<string, reno.AppConfig> = {};
    if (await fs.pathExists(appsPath)) {
      config = await fs.readJson(appsPath);
    }
    config[appName] = appConfig;
    await fs.writeJson(appsPath, config, { spaces: 2 });
  } catch (error: any) {
    throw new Error(`Error updating config file: ${error.message}`);
  }
}

export async function loadAppConfigFile(appsPath: string): Promise<Record<string, reno.AppConfig>> {}
