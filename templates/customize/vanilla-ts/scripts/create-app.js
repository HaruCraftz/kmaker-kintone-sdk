import path from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import { fileURLToPath } from 'url';

const DEV_CONFIG_FILE_NAME = 'apps.dev.json';
const PROD_CONFIG_FILE_NAME = 'apps.prod.json';

/**
 * 初期のアプリ設定情報を作成する関数
 * @param {number} appId - アプリID
 * @returns {object} 初期のアプリ設定情報
 */
function createInitialAppConfig(appId) {
  return {
    appId,
    apiTokens: {},
    cdn: {
      scope: 'ALL',
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
 * 設定ファイルを作成 or 更新する関数
 * @param {string} configFilePath - 設定ファイルのパス
 * @param {string} appName - アプリケーション名
 * @param {object} appConfig - アプリケーション設定情報
 */
async function saveAppConfigFile(configFilePath, appName, appConfig) {
  try {
    let config = {};
    if (await fs.pathExists(configFilePath)) {
      config = await fs.readJson(configFilePath);
    }
    config[appName] = appConfig;
    await fs.writeJson(configFilePath, config, { spaces: 2 });
  } catch (error) {
    throw new Error(`Error updating config file: ${error.message}`);
  }
}

async function main() {
  try {
    // 現在のファイル位置から各ディレクトリのパスを解決
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.join(__dirname, '..');
    const templatesDir = path.join(rootDir, 'templates');
    const configDir = path.join(rootDir, 'config');
    const appsDir = path.join(rootDir, 'src', 'apps');

    // テンプレートおよび設定ファイルのパスを設定
    const devConfigPath = path.join(configDir, DEV_CONFIG_FILE_NAME);
    const prodConfigPath = path.join(configDir, PROD_CONFIG_FILE_NAME);

    // configディレクトリの存在確認
    const configTemplateDir = path.join(templatesDir, 'config');
    if (!(await fs.pathExists(configDir))) {
      await fs.copy(configTemplateDir, configDir);
    }

    // ユーザーからアプリ情報の入力を取得
    const questions = [
      {
        type: 'text',
        name: 'appName',
        message: '開発するアプリ名を入力してください:',
        validate: (input) => (input.trim() !== '' ? true : 'アプリ名を入力してください'),
      },
      {
        type: 'number',
        name: 'devAppId',
        message: '開発環境のアプリIDを入力してください:',
        style: 'default',
        validate: (input) => (input !== '' ? true : 'アプリIDを入力してください'),
      },
      {
        type: 'number',
        name: 'prodAppId',
        message: '本番環境のアプリIDを入力してください:',
        style: 'default',
      },
      {
        onCancel: () => {
          throw new Error('✖' + ' Operation cancelled');
        },
      },
    ];

    const { appName, devAppId, prodAppId } = await prompts(questions);
    console.log(''); // prompts後に改行

    // appsディレクトリの存在確認と作成
    await fs.ensureDir(appsDir);

    // 新しいアプリの出力先ディレクトリを決定
    const appOutputDir = path.join(appsDir, appName);
    if (await fs.pathExists(appOutputDir)) {
      console.error(`Error: The directory '${appName}' already exists.`);
      process.exit(1);
    }

    // アプリのテンプレートディレクトリをコピーして新しいアプリディレクトリを作成
    const appTemplateDir = path.join(templatesDir, 'app');
    await fs.copy(appTemplateDir, appOutputDir);

    // 開発環境と本番環境の初期アプリ設定情報を作成
    const devAppConfig = createInitialAppConfig(devAppId);
    const prodAppConfig = createInitialAppConfig(prodAppId);

    // 並列で設定ファイルを更新
    await Promise.all([saveAppConfigFile(devConfigPath, appName, devAppConfig), saveAppConfigFile(prodConfigPath, appName, prodAppConfig)]);

    console.log(`The folder '${appName}' has been created!`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();
