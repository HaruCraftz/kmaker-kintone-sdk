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

4. アプリの型情報を取得する(typescriptのみ)

```
npm run dts
```

## 開発

### 開発環境へのデプロイ

```
npm run dev
```

### 本番環境へのデプロイ

```
nom run build
```

# ディレクトリ構成

```
root/
├── config/                        # 設定管理
│   ├── apps.dev.json              # 開発環境アプリ情報
│   └── apps.prod.json             # 本番環境アプリ情報
│
├── scripts/                       # スクリプト管理
│   ├── start.js                   # 環境情報の設定
│   ├── create-app.js              # アプリ情報の保管と作業ディレクトリの追加
│   ├── generate-dts.js            # kintone-dts-gen の実行
│   └── upload.js                  # kintone-customize-uploader の実行
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
│   ├── components/                 # 汎用的なコンポーネントを格納する
│   ├── constants/                  # 汎用的な変数を格納
│   ├── global/                     # グローバル変数を格納
│   └── utils/                      # 汎用的な関数を格納
│
├── .husky/                         # huskyの設定ディレクトリ
├── .gitignore                      # Git管理対象外の設定
├── .eslintrc.js                    # ESLint 設定
├── .prettierrc                     # Prettier 設定
├── customize-manifest.json         # kintone-customize-uploader の実行ファイル
├── package.json                    # 依存関係
├── README.md                       # プロジェクトの説明
├── tsconfig.json                   # TypeScript 設定
├── webpack.common.js               # Webpack 共通設定
├── webpack.dev.js                  # Webpack dev 環境設定 (webpack-merge 使用)
└── webpack.prod.js                 # Webpack prod 環境設定 (webpack-merge 使用)
```

# ブランチの運用方法

GitFeatureFlow
[GitFlowは使わない！シンプルな「GitFeatureFlow」を紹介します](https://developers.gnavi.co.jp/entry/GitFeatureFlow/koyama)
