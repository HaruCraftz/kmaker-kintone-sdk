import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const DEV_SECRET_FILE_NAME = 'secret.dev.json';
const PROD_SECRET_FILE_NAME = 'secret.prod.json';

/**
 * 指定環境用の設定ファイルをテンプレートから作成し、認証情報を更新します。
 * @param {string} secretFileName - 作成する設定ファイル名
 * @param {string} secretsDir - 設定ファイルを保存するディレクトリのパス
 * @param {{ baseUrl: string, username: string, password: string }} credentials - 環境固有の認証情報
 */
async function createSecretFile(secretFileName, secretsDir, { baseUrl, username, password }) {
  try {
    const secretFilePath = path.join(secretsDir, secretFileName);
    const newCredentials = { baseUrl, username, password, proxy: 'http://localhost:8000' };
    await fs.writeJson(secretFilePath, newCredentials, { spaces: 2 });
    console.log(`${secretFileName} が作成されました。`);
  } catch (error) {
    console.error(`Error: Failed to process secret file ${secretFileName}: ${error.message}`);
  }
}

async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.join(__dirname, '..');
    const secretsDir = path.join(rootDir, '.secret');

    // 各環境の設定ファイルパス
    const devSecretPath = path.join(secretsDir, DEV_SECRET_FILE_NAME);
    const prodSecretPath = path.join(secretsDir, PROD_SECRET_FILE_NAME);

    // Secretディレクトリの存在チェック
    if (!(await fs.pathExists(secretsDir))) {
      await fs.ensureDir(secretsDir);
    }

    // 開発・本番設定ファイルの存在を並列にチェック
    const [devSecretExists, prodSecretExists] = await Promise.all([fs.pathExists(devSecretPath), fs.pathExists(prodSecretPath)]);

    if (devSecretExists && prodSecretExists) {
      console.error('Error: Secret files already exist.');
      process.exit(1);
    }

    const questions = [];

    if (!devSecretExists) {
      questions.push(
        {
          type: 'text',
          name: 'devUrl',
          message: '開発環境のURLを入力してください:',
          initial: 'https://example.cybozu.com',
        },
        {
          type: 'text',
          name: 'devUserName',
          message: '開発環境のユーザー名を入力してください:',
          validate: (input) => (input.trim() !== '' ? true : 'ユーザー名を入力してください'),
        },
        {
          type: 'password',
          name: 'devPassword',
          message: '開発環境のパスワードを入力してください:',
          validate: (input) => (input.trim() !== '' ? true : 'パスワードを入力してください'),
        }
      );
    }

    if (!prodSecretExists) {
      questions.push(
        {
          type: 'text',
          name: 'prodUrl',
          message: '本番環境のURLを入力してください:',
          initial: 'https://example.cybozu.com',
        },
        {
          type: 'text',
          name: 'prodUserName',
          message: '本番環境のユーザー名を入力してください:',
        },
        {
          type: 'password',
          name: 'prodPassword',
          message: '本番環境のパスワードを入力してください:',
        }
      );
    }

    const answers = await prompts(questions);
    console.log(''); // prompts後の改行

    if (!devSecretExists) {
      const { devUrl, devUserName, devPassword } = answers;
      await createSecretFile(DEV_SECRET_FILE_NAME, secretsDir, {
        baseUrl: devUrl,
        username: devUserName,
        password: devPassword,
      });
    }

    if (!prodSecretExists) {
      const { prodUrl, prodUserName, prodPassword } = answers;
      await createSecretFile(PROD_SECRET_FILE_NAME, secretsDir, {
        baseUrl: prodUrl,
        username: prodUserName,
        password: prodPassword,
      });
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();
