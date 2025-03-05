import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { PROFILES_FILE_NAME } from "../constants/fileName.js";
import { ENVIRONMENTS } from "../constants/env.js";

type Answers = {
  env: Kcmaker.EnvironmentValue;
  baseUrl: string;
  username: string;
  password: string;
};

export default function command() {
  program.command("setup").description("add kintone profile on your environment.").action(action);
}

async function action() {
  try {
    const cwd = process.cwd();
    const configDir = path.join(cwd, CONFIG_DIRECTORY);
    const profilesPath = path.join(configDir, PROFILES_FILE_NAME);

    const { env, baseUrl, username, password }: Answers = await prompts([
      {
        type: "select",
        name: "env",
        message: "環境を選択してください:",
        choices: Object.values(ENVIRONMENTS).map((env) => ({ title: env.title, value: env.value })),
      },
      {
        type: "text",
        name: "baseUrl",
        message: "URLを入力してください:",
        initial: "https://example.cybozu.com",
      },
      {
        type: "text",
        name: "username",
        message: "ユーザー名を入力してください:",
        validate: (input: string) => (input.trim() !== "" ? true : "ユーザー名を入力してください"),
      },
      {
        type: "password",
        name: "password",
        message: "パスワードを入力してください:",
        validate: (input: string) => (input.trim() !== "" ? true : "パスワードを入力してください"),
      },
    ]);
    console.log(""); // prompts後の改行

    const profilesExists = await fs.pathExists(profilesPath);
    const profiles: Kcmaker.Profiles = profilesExists ? await fs.readJson(profilesPath) : {};

    const newProfile: Kcmaker.Profile = { env, baseUrl, username, password, proxy: "http://localhost:8000" };
    profiles[env] = newProfile;

    // ディレクトリの存在チェックと作成
    await fs.ensureDir(configDir);

    // プロファイル作成
    await fs.writeJson(profilesPath, profiles, { spaces: 2 });
    console.log(`Profile "${env}" has been saved.`);
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
