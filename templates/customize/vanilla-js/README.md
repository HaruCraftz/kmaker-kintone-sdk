# KCMaker - 🍳 Kintone Customization Maker 🍳

Kintone SDK for Node.js

<br>

## Installation

> 新規で環境を構築する場合は Getting Start を参照

```bash
npm install kcmaker
```

<br>

## Getting Start

### 1. プロジェクトを作成する

```bash
npm create kcmaker
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境情報を設定する

```bash
npm run setup
```

環境情報には、"develop"と"staging"と"production"を指定できます。
そして、作成した環境情報ファイルに基づいてこれ以降のコマンドが実行されます。

### 4. 開発するアプリの情報と作業ディレクトリを設定する

> アプリの作業ディレクトリやアプリIDなどの情報を追加するときは全てこのコマンドで実行する。
> アプリID、APIトークン、ViewIDは、グローバル変数で取得可能

```bash
npm run app
```

### 5. アプリの型情報を取得する(typescript環境のみ)

```bash
npm run dts
```

### 6. 成果物をデプロイする

```bash
npm run launch
```

エントリーポイントは、`root/src/apps/your-app-name/deskop or mobile/index.ts`になります。
そのためアプリディレクトリ内に"desktopディレクトリかmobileディレクトリのどちらか"と"indexファイル"が必須となります。

<br>

## Usage

### kcmaker

> 以下のコマンドでヘルプを表示

```bash
npx kcmaker --help
```

```
Usage: kcmaker [options] [command]

🍳 kcmaker helps your kintone customization.

Options:
  -h, --help        read more information

Commands:
  setup             add kintone profile on your environment.
  app               create a new application configuration.
  dts [options]     generate type definitions for Kintone app.
  build [options]   build the project for production.
  launch [options]  launch kintone customization for each environments.
  help [command]    display help for command
```

<br>

## Structure

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

## ブランチの運用方法

GitFeatureFlow
[GitFlowは使わない！シンプルな「GitFeatureFlow」を紹介します](https://developers.gnavi.co.jp/entry/GitFeatureFlow/koyama)
