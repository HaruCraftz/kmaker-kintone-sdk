import path from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

/**
 * 指定ディレクトリ内のサブディレクトリ名を取得する
 * @param {string} directoryPath - 対象ディレクトリのパス
 * @returns {Promise<string[]>} サブディレクトリ名の配列
 */
async function getSubdirectoryNames(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const subdirectoryNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (subdirectoryNames.length === 0) {
    throw new Error(`No valid subdirectories found in directory: ${directoryPath}`);
  }
  return subdirectoryNames;
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
 * kintone-customize-uploader を実行する
 * @param {string[]} args - コマンドライン引数の配列
 * @returns {Promise<void>}
 */
function runUploader(args) {
  return new Promise((resolve, reject) => {
    const uploaderProcess = spawn('kintone-customize-uploader', args, { shell: true });
    uploaderProcess.stdout.on('data', (data) => process.stdout.write(data.toString()));
    uploaderProcess.stderr.on('data', (data) => process.stderr.write(data.toString()));
    uploaderProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Uploader exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
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

  const manifestPath = path.join(rootDirectory, 'customize-manifest.json');
  await updateManifest(manifestPath, appConfig);

  const uploaderArgs = ['--base-url', baseUrl, '--username', username, '--password', password, manifestPath];

  if (useProxy) {
    if (!proxy) {
      throw new Error('Proxy mode is enabled, but no proxy configuration was found.');
    }
    uploaderArgs.push('--proxy', proxy);
  }

  console.log(`\n🚀 Uploading customizations for app: "${appName}"...`);
  await runUploader(uploaderArgs);

  console.log(`✅ Upload completed successfully for app: "${appName}"`);
}

async function main() {
  try {
    // __filename, __dirname の取得
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDirectory = path.join(__dirname, '..');
    const secretDirectory = path.join(rootDirectory, '.secret');
    const configDirectory = path.join(rootDirectory, 'config');
    const distDirectory = path.join(rootDirectory, 'dist');

    // 必要ディレクトリの存在確認
    for (const dir of [secretDirectory, configDirectory, distDirectory]) {
      if (!(await fs.pathExists(dir))) {
        throw new Error(`Required directory not found: ${dir}`);
      }
    }

    // dist 内のサブディレクトリ（アプリフォルダ）の取得
    const appNames = await getSubdirectoryNames(distDirectory);
    let appChoices = appNames.map((folder) => ({ title: folder, value: folder }));
    if (appChoices.length > 1) {
      appChoices = [{ title: 'ALL', value: 'ALL' }, ...appChoices];
    }

    const questions = [
      {
        type: 'select',
        name: 'selectedApp',
        message: '対象のアプリフォルダを選択してください:',
        choices: appChoices,
        initial: 0,
      },
      {
        type: 'select',
        name: 'env',
        message: '環境を選択してください:',
        choices: ['development', 'production'].map((env) => ({ title: env, value: env })),
      },
      {
        type: 'confirm',
        name: 'useProxy',
        message: 'プロキシモードを使用しますか？',
        initial: false,
      },
    ];

    // ユーザー入力の取得
    const { selectedApp, env, useProxy } = await prompts(questions);
    console.log(''); // prompts後の改行

    // 環境に応じた設定ファイルの読み込み
    const secretFiles = {
      development: 'secret.dev.json',
      production: 'secret.prod.json',
    };
    const configFiles = {
      development: 'apps.dev.json',
      production: 'apps.prod.json',
    };
    const secretFilePath = path.join(secretDirectory, secretFiles[env]);
    const configFilePath = path.join(configDirectory, configFiles[env]);
    const credentials = await fs.readJson(secretFilePath);
    const appsConfig = await fs.readJson(configFilePath);

    // "ALL" 選択時は全アプリ、個別選択時は対象アプリのみ処理
    if (selectedApp === 'ALL') {
      for (const appName of appNames) {
        try {
          await uploadAppCustomization(rootDirectory, appName, credentials, appsConfig, useProxy);
        } catch (err) {
          console.error(`Error processing folder ${appName}: ${err.message}`);
        }
      }
    } else {
      await uploadAppCustomization(rootDirectory, selectedApp, credentials, appsConfig, useProxy);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();
