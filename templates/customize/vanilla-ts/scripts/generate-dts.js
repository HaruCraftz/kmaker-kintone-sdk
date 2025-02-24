import path from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

/**
 * 指定ディレクトリ内のサブディレクトリ名を取得する
 * @param {string} directoryPath - 対象ディレクトリのパス
 * @returns {Promise<string[]>} サブディレクトリ名の配列
 */
async function getSubdirectoryNames(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const subdirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (subdirectories.length === 0) {
    throw new Error(`No valid subdirectories found in directory: ${directoryPath}`);
  }
  return subdirectories;
}

/**
 * kintone-dts-gen を指定の引数で実行する関数
 * @param {string[]} args - コマンドライン引数の配列
 * @returns {Promise<void>}
 */
function runDtsGenerator(args) {
  return new Promise((resolve, reject) => {
    const generatorProcess = spawn('kintone-dts-gen', args, { shell: true });
    generatorProcess.stdout.on('data', (data) => process.stdout.write(data.toString()));
    generatorProcess.stderr.on('data', (data) => process.stderr.write(data.toString()));
    generatorProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`kintone-dts-gen exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * 指定されたアプリフォルダに対して .d.ts ジェネレータを実行する関数
 * @param {string} appsDirectory - アプリディレクトリのパス
 * @param {string} appName - アプリフォルダ名
 * @param {Object} credentials - 認証情報 (baseUrl, proxy, username, password)
 * @param {Object} appsConfig - 全アプリの設定情報
 * @param {boolean} useProxy - プロキシ使用の有無
 * @returns {Promise<void>}
 */
async function generateTypeDefinitionsForApp(appsDirectory, appName, credentials, appsConfig, useProxy) {
  const appDirectory = path.join(appsDirectory, appName);
  if (!(await fs.pathExists(appDirectory))) {
    throw new Error(`App folder "${appName}" does not exist:\n${appDirectory}`);
  }

  const { baseUrl, proxy, username, password } = credentials;
  const appConfig = appsConfig[appName];
  if (!appConfig) {
    throw new Error(`Configuration for app "${appName}" not found.`);
  }

  // 出力先の .d.ts ファイルパスを設定
  const outputFilePath = path.join(appDirectory, 'types', 'kintone.d.ts');

  // kintone-dts-gen に渡す引数を組み立てる
  const cmdArgs = ['--base-url', baseUrl, '-u', username, '-p', password, '--app-id', appConfig.appId, '-o', outputFilePath];

  if (useProxy) {
    if (!proxy) {
      throw new Error('Proxy mode is enabled, but no proxy configuration was found.');
    }
    cmdArgs.push('--proxy', proxy);
  }

  console.log(`\n🚀 Generating type definitions for "${appName}"...`);
  await runDtsGenerator(cmdArgs);

  console.log(`✅ Type definitions successfully generated for "${appName}".`);
}

async function main() {
  try {
    // 現在のファイル位置から各パスを解決
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.join(__dirname, '..');
    const secretDir = path.join(rootDir, '.secret');
    const configDir = path.join(rootDir, 'config');
    const appsDir = path.join(rootDir, 'src', 'apps');
    const devSecretFilePath = path.join(secretDir, 'secret.dev.json');
    const devConfigFilePath = path.join(configDir, 'apps.dev.json');

    // 必要なディレクトリの存在確認
    for (const dir of [secretDir, configDir, appsDir]) {
      if (!(await fs.pathExists(dir))) {
        throw new Error(`Required directory not found:\n${dir}`);
      }
    }

    if (!(await fs.pathExists(devSecretFilePath))) {
      throw new Error('Please run command "npm run start" first.');
    }

    if (!(await fs.pathExists(devConfigFilePath))) {
      throw new Error('Please run command "npm run create:app" first.');
    }

    // アプリフォルダの一覧を取得
    const appNames = await getSubdirectoryNames(appsDir);
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
        type: 'confirm',
        name: 'useProxy',
        message: 'プロキシモードを使用しますか？',
        initial: false,
      },
    ];

    // ユーザーから入力を取得
    const { selectedApp, useProxy } = await prompts(questions);
    console.log(''); // prompts後の改行

    // 設定情報を読み込む
    const credentials = await fs.readJson(devSecretFilePath);
    const appsConfig = await fs.readJson(devConfigFilePath);

    // "ALL" 選択時は全アプリに対して順次実行、個別選択時は選択アプリのみ実行
    if (selectedApp === 'ALL') {
      for (const appName of appNames) {
        try {
          await generateTypeDefinitionsForApp(appsDir, appName, credentials, appsConfig, useProxy);
        } catch (err) {
          console.error(`Error processing app "${appName}": ${err.message}`);
        }
      }
    } else {
      await generateTypeDefinitionsForApp(appsDir, selectedApp, credentials, appsConfig, useProxy);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();
