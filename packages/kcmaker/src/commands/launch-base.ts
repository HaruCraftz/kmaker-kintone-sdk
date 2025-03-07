import path from "path";
import fs from "fs-extra";
import { runCommand } from "../lib/spawn.js";

enum Scope {
  all = "ALL",
  admin = "ADMIN",
  none = "NONE",
}

/**
 * 指定アプリフォルダに対して manifest の更新とアップロード処理を実行する
 */
export async function deployAppCustomization(
  appName: string,
  appsConfig: Kcmaker.AppsConfig,
  { baseUrl, username, password, proxy }: Kcmaker.Profile,
  scope: "all" | "admin" | "none",
  useProxy: boolean,
) {
  const cwd = process.cwd();
  const appConfig = appsConfig[appName];

  if (!appConfig) {
    throw new Error(`Configuration for app "${appName}" not found.`);
  }

  // customize-manifest.jsonを更新（上書き）
  const manifestPath = path.join(cwd, "customize-manifest.json");
  await fs.ensureFile(manifestPath); // ファイルが存在しない場合は作成
  const mergedManifest = { app: appConfig.appId, scope: Scope[scope], ...appConfig.cdn };
  await fs.writeJson(manifestPath, mergedManifest, { spaces: 2 });

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
