import path from "path";
import fs from "fs-extra";

export type Credentials = {
  baseUrl: string;
  username: string;
  password: string;
};

/**
 * 指定環境用の設定ファイルをテンプレートから作成し、認証情報を更新する
 * @param secretsDir 設定ファイルを保存するディレクトリのパス
 * @param secretFileName 作成する設定ファイル名
 * @param credentials 環境固有の認証情報
 */
export async function createSecretFile(
  secretsDir: string,
  secretFileName: string,
  credentials: Credentials,
): Promise<void> {
  try {
    const secretFilePath = path.join(secretsDir, secretFileName);
    const newCredentials = { ...credentials, proxy: "http://localhost:8000" };
    await fs.writeJson(secretFilePath, newCredentials, { spaces: 2 });
    console.log(`${secretFileName} が作成されました。`);
  } catch (error: any) {
    console.error(`Error: Failed to process secret file ${secretFileName}: ${error.message}`);
    throw error;
  }
}
