import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { fileURLToPath } from "url";
import { WOKSPACE_DIRECTORY } from "../constants/directory.js";
import { DEV_CONFIG_FILE_NAME, PROD_CONFIG_FILE_NAME } from "../constants/fileName.js";
import { APP_INFO_PROMPTS } from "../constants/prompt.js";

/**
 * アプリ設定情報の型定義
 */
export interface AppConfig {
  appId: number;
  apiTokens: Record<string, any>;
  viewId: Record<string, any>;
  cdn: {
    scope: string;
    desktop: {
      js: any[];
      css: any[];
    };
    mobile: {
      js: any[];
    };
  };
}

/**
 * 初期のアプリ設定情報を作成する関数
 * @param appId アプリID
 * @returns 初期のアプリ設定情報
 */
export function createInitialAppConfig(appId: number): AppConfig {
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
 * @param configFilePath 設定ファイルのパス
 * @param appName アプリケーション名
 * @param appConfig アプリケーション設定情報
 */
export async function saveAppConfigFile(configFilePath: string, appName: string, appConfig: AppConfig): Promise<void> {
  try {
    let config: Record<string, any> = {};
    if (await fs.pathExists(configFilePath)) {
      config = await fs.readJson(configFilePath);
    }
    config[appName] = appConfig;
    await fs.writeJson(configFilePath, config, { spaces: 2 });
  } catch (error: any) {
    throw new Error(`Error updating config file: ${error.message}`);
  }
}

/**
 * アプリの作成処理を行う関数
 * @returns 作成されたアプリの名前
 */
export async function runAppCreation(): Promise<string> {
  // __dirname はパッケージ内のファイル位置を示す
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // templatesDir はパッケージ内のテンプレートディレクトリを指す
  const templatesDir = path.join(__dirname, "..", "templates");

  // appsDir はインストール先プロジェクトの src/apps を指す（process.cwd() はコマンド実行時のカレントディレクトリ）
  const appsDir = path.join(process.cwd(), "src", "apps");

  // テンプレートおよび設定ファイルのパスを設定
  const devConfigPath = path.join(WOKSPACE_DIRECTORY, DEV_CONFIG_FILE_NAME);
  const prodConfigPath = path.join(WOKSPACE_DIRECTORY, PROD_CONFIG_FILE_NAME);

  // パッケージ内の config テンプレートディレクトリ
  const configTemplateDir = path.join(templatesDir, "config");
  if (!(await fs.pathExists(WOKSPACE_DIRECTORY))) {
    await fs.copy(configTemplateDir, WOKSPACE_DIRECTORY);
  }

  // ユーザーからアプリ情報の入力を取得
  type AppInfo = {
    appName: string;
    devAppId: number;
    prodAppId: number;
  };
  const response = await prompts(APP_INFO_PROMPTS);
  const { appName, devAppId, prodAppId } = response;
  console.log(""); // prompts 後に改行

  // インストール先プロジェクトの apps ディレクトリの存在確認と作成
  await fs.ensureDir(appsDir);

  // 新しいアプリの出力先ディレクトリ（プロジェクトの src/apps/<appName>）
  const appOutputDir = path.join(appsDir, appName);
  if (await fs.pathExists(appOutputDir)) {
    throw new Error(`The directory '${appName}' already exists.`);
  }

  // パッケージ内のアプリテンプレートディレクトリからコピー
  const appTemplateDir = path.join(templatesDir, "app");
  await fs.copy(appTemplateDir, appOutputDir);

  // 開発環境と本番環境の初期アプリ設定情報を作成
  const devAppConfig = createInitialAppConfig(devAppId);
  const prodAppConfig = createInitialAppConfig(prodAppId);

  // 並列で設定ファイルを更新
  await Promise.all([
    saveAppConfigFile(devConfigPath, appName, devAppConfig),
    saveAppConfigFile(prodConfigPath, appName, prodAppConfig),
  ]);

  return appName;
}
