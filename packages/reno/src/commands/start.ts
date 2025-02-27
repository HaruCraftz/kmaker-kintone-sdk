import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import prompts from "prompts";
import { WOKSPACE_DIRECTORY } from "../constants/directory.js";
import { DEV_SECRET_FILE_NAME, PROD_SECRET_FILE_NAME } from "../constants/fileName.js";
import { createSecretFile } from "../utils/secret.js";

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
      console.error("Error: Secret files already exist.");
      process.exit(1);
    }

    const questions = [];

    if (!devSecretExists) {
      questions.push(
        {
          type: "text",
          name: "devUrl",
          message: "開発環境のURLを入力してください:",
          initial: "https://example.cybozu.com",
        },
        {
          type: "text",
          name: "devUserName",
          message: "開発環境のユーザー名を入力してください:",
          validate: (input: string) => (input.trim() !== "" ? true : "ユーザー名を入力してください"),
        },
        {
          type: "password",
          name: "devPassword",
          message: "開発環境のパスワードを入力してください:",
          validate: (input: string) => (input.trim() !== "" ? true : "パスワードを入力してください"),
        },
      );
    }

    if (!prodSecretExists) {
      questions.push(
        {
          type: "text",
          name: "prodUrl",
          message: "本番環境のURLを入力してください:",
          initial: "https://example.cybozu.com",
        },
        {
          type: "text",
          name: "prodUserName",
          message: "本番環境のユーザー名を入力してください:",
        },
        {
          type: "password",
          name: "prodPassword",
          message: "本番環境のパスワードを入力してください:",
        },
      );
    }

    const answers = await prompts(questions);
    console.log(""); // prompts後の改行

    if (!devSecretExists) {
      const { devUrl, devUserName, devPassword } = answers;
      await createSecretFile(DEV_SECRET_FILE_NAME, WOKSPACE_DIRECTORY, {
        baseUrl: devUrl,
        username: devUserName,
        password: devPassword,
      });
    }

    if (!prodSecretExists) {
      const { prodUrl, prodUserName, prodPassword } = answers;
      await createSecretFile(PROD_SECRET_FILE_NAME, WOKSPACE_DIRECTORY, {
        baseUrl: prodUrl,
        username: prodUserName,
        password: prodPassword,
      });
    }
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}
