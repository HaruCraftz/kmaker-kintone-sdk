import prompts from "prompts";

export const DEV_CREDENTIALS_PROMPTS: prompts.PromptObject[] = [
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
];

export const PROD_CREDENTIALS_PROMPTS: prompts.PromptObject[] = [
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
];

export const APP_INFO_PROMPTS: prompts.PromptObject[] = [
  {
    type: "text",
    name: "appName",
    message: "開発するアプリ名を入力してください:",
    validate: (input) => (input.trim() !== "" ? true : "アプリ名を入力してください"),
  },
  {
    type: "number",
    name: "devAppId",
    message: "開発環境のアプリIDを入力してください:",
    style: "default",
    validate: (input) => (input !== "" ? true : "アプリIDを入力してください"),
  },
  {
    type: "number",
    name: "prodAppId",
    message: "本番環境のアプリIDを入力してください:",
    style: "default",
  },
];
