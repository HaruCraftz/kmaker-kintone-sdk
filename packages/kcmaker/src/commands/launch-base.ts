import path from "path";
import fs from "fs-extra";
import { runCommand } from "../lib/spawn.js";

enum Scope {
  all = "ALL",
  admin = "ADMIN",
  none = "NONE",
}

function filterAssets(appConfig: Kcmaker.AppConfig, platform: "desktop" | "mobile", keyword: string) {
  appConfig.cdn[platform].js = appConfig.cdn[platform].js.filter((asset) => !asset.includes(keyword));
  appConfig.cdn[platform].css = appConfig.cdn[platform].css.filter((asset) => !asset.includes(keyword));
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
  const appDistDir = path.join(cwd, "dist", appName);
  const appConfig = appsConfig[appName];

  if (!appConfig) {
    throw new Error(`Configuration for app "${appName}" not found.`);
  }

  // cdnの旧アセットを除外
  filterAssets(appConfig, "desktop", "dist");
  filterAssets(appConfig, "mobile", "dist");

  // distフォルダ内のアセットをcdnに追加
  const files = await fs.readdir(appDistDir);
  files.forEach((file) => {
    const assetPath = path.join("dist", appName, file);
    if (file.includes("desktop")) {
      file.endsWith(".js") ? appConfig.cdn.desktop.js.unshift(assetPath) : appConfig.cdn.desktop.css.unshift(assetPath);
    } else if (file.includes("mobile")) {
      file.endsWith(".js") ? appConfig.cdn.mobile.js.unshift(assetPath) : appConfig.cdn.mobile.css.unshift(assetPath);
    }
  });

  // customize-manifest.jsonを更新（上書き）
  const manifestPath = path.join(cwd, "customize-manifest.json");
  await fs.ensureFile(manifestPath); // ファイルが存在しない場合は作成
  const mergedManifest = { app: appConfig.appId, scope: Scope[scope], ...appConfig.cdn };
  await fs.writeJson(manifestPath, mergedManifest, { spaces: 2 }); // customize-manifest.json

  const args: string[] = ["--base-url", baseUrl, "--username", username, "--password", password, manifestPath];

  if (useProxy) {
    if (!proxy) {
      throw new Error("Proxy mode is enabled, but no proxy configuration was found.");
    }
    args.push("--proxy", proxy);
  }

  await runCommand("kintone-customize-uploader", args);
}
