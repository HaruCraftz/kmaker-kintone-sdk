import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { WOKSPACE_DIRECTORY } from "../constants/directory.js";
import { DEV_SECRET_FILE_NAME, PROD_SECRET_FILE_NAME } from "../constants/fileName.js";
import { DEV_CREDENTIALS_PROMPTS, PROD_CREDENTIALS_PROMPTS } from "../constants/prompt.js";
import { createSecretFile, type Credentials } from "../lib/secret.js";

export default function command() {
  program.command("start").description("Set up the development environment").action(action);
}

async function action() {
  try {
    // 各環境の設定ファイルパス
    const devSecretPath = path.join(WOKSPACE_DIRECTORY, DEV_SECRET_FILE_NAME);
    const prodSecretPath = path.join(WOKSPACE_DIRECTORY, PROD_SECRET_FILE_NAME);

    // ディレクトリの存在チェック
    if (!(await fs.pathExists(WOKSPACE_DIRECTORY))) {
      await fs.ensureDir(WOKSPACE_DIRECTORY);
    }

    // 開発・本番設定ファイルの存在を並列にチェック
    const [devSecretExists, prodSecretExists] = await Promise.all([
      fs.pathExists(devSecretPath),
      fs.pathExists(prodSecretPath),
    ]);

    if (devSecretExists && prodSecretExists) {
      console.error("Secret files already exist.");
      process.exit(1);
    }

    const questions: prompts.PromptObject[] = [];

    if (!devSecretExists) {
      questions.push(...DEV_CREDENTIALS_PROMPTS);
    }

    if (!prodSecretExists) {
      questions.push(...PROD_CREDENTIALS_PROMPTS);
    }

    const answers = await prompts(questions);
    console.log(""); // prompts後の改行

    if (!devSecretExists) {
      const { devUrl, devUserName, devPassword } = answers;
      const devCredentials: Credentials = {
        baseUrl: devUrl,
        username: devUserName,
        password: devPassword,
      };
      await createSecretFile(DEV_SECRET_FILE_NAME, WOKSPACE_DIRECTORY, devCredentials);
    }

    if (!prodSecretExists) {
      const { prodUrl, prodUserName, prodPassword } = answers;
      const prodCredentials: Credentials = {
        baseUrl: prodUrl,
        username: prodUserName,
        password: prodPassword,
      };
      await createSecretFile(PROD_SECRET_FILE_NAME, WOKSPACE_DIRECTORY, prodCredentials);
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
