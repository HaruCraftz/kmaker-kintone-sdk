import path from "path";
import fs from "fs-extra";
import { runCommand } from "../lib/spawn.js";

/**
 * 指定されたアプリフォルダに対して .d.ts ジェネレータを実行する関数
 * @param appsDir アプリフォルダのパス
 * @param appName アプリ名
 * @param profile プロファイル情報
 * @param appsConfig アプリ設定情報
 * @param useProxy プロキシを使用するか
 */
export async function generateTypeDefinitionsForApp(
  appsDir: string,
  appName: string,
  appsConfig: Record<string, Kcmaker.AppConfig>,
  { baseUrl, username, password, proxy }: Kcmaker.Profile,
  useProxy: boolean,
) {
  const appDir = path.join(appsDir, appName);

  if (!(await fs.pathExists(appDir))) {
    throw new Error(`App folder "${appName}" does not exist:\n${appDir}`);
  }

  const appConfig = appsConfig[appName];

  if (!appConfig) {
    throw new Error(`Configuration for app "${appName}" not found.`);
  }

  // 出力先の .d.ts ファイルパスを設定
  const outputFilePath = path.join(appDir, "types", "kintone.d.ts");

  // kintone-dts-gen に渡す引数を組み立てる
  const args: string[] = [
    "--base-url",
    baseUrl,
    "-u",
    username,
    "-p",
    password,
    "--app-id",
    String(appConfig.appId),
    "-o",
    outputFilePath,
  ];

  if (useProxy) {
    if (!proxy) {
      throw new Error("Proxy mode is enabled, but no proxy configuration was found.");
    }
    args.push("--proxy", proxy);
  }

  await runCommand("kintone-dts-gen", args);
}
