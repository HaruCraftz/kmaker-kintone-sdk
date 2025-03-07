# KCMaker - 🍳 Kintone Customization Maker 🍳

kintone SDK for Node.js

## Getting Start

1. プロジェクトを作成する

```
npm create kcmaker
```

2. 依存関係をインストール

```
npm install
```

3. 環境情報を設定する

```
npm run setup
```

4. 開発するアプリの情報と作業ディレクトリを設定する

- 開発するアプリを追加するときは全てこのコマンドで実行する

```
npm run app
```

4. アプリの型情報を取得する(typescript環境のみ)

```
npm run dts
```

5. 成果物をデプロイする

```
npm run launch
```

## Usage (kcmaker)

> kcmaker [command]

- setup add kintone profile on your environment.
- app create a new application configuration.
- dts [options] generate type definitions for Kintone app.
- build [options] build the project for production.
- launch [options] launch kintone customization for each environments.
- help [command] display help for command

## ディレクトリ構成

```
root/
├── .kintone/                      # 設定管理
│   ├── profiles.json              # 環境情報 - setupコマンドによって生成
│   ├── apps.dev.json              # 開発環境アプリ情報 - appコマンドによって生成
│   ├── apps.stg.json              # 検証環境アプリ情報 - appコマンドによって生成
│   └── apps.prod.json             # 本番環境アプリ情報 - appコマンドによって生成
│
├── src/
│   ├── apps/
│   │   ├── app1/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   ├── types/
│   │   │   ├── desktop/
│   │   │   │   ├── index.ts
│   │   │   ├── mobile/
│   │   │   │   ├── index.ts
│   ├── components/                 # 汎用的なコンポーネントを格納
│   ├── constants/                  # 汎用的な変数を格納
│   ├── global/                     # グローバル変数を格納(appIdやAPIトークンなど)
│   └── utils/                      # 汎用的な関数を格納
│
├── .husky/                         # huskyの設定ディレクトリ
├── .gitignore                      # Git管理対象外の設定
├── .eslint.config.js               # ESLint 設定
├── .prettierrc                     # Prettier 設定
├── customize-manifest.json         # kintone-customize-uploader の実行ファイル
├── package.json                    # 依存関係
├── README.md                       # プロジェクトの説明
└── tsconfig.json                   # TypeScript 設定(TS環境のみ)
```

# ブランチの運用方法

GitFeatureFlow
[GitFlowは使わない！シンプルな「GitFeatureFlow」を紹介します](https://developers.gnavi.co.jp/entry/GitFeatureFlow/koyama)
