# 画像変換・軽量化ツール

行政手続き・メール添付・Web掲載向けの画像変換Webアプリ。  
**完全クライアントサイド処理** — ファイルは外部に一切送信されません。

## 機能

- JPEG / PNG / WebP / HEIC → JPEG / PNG / WebP 変換
- 品質スライダーによる圧縮
- 目標ファイルサイズ指定（2MB / 1MB / 500KB / 任意入力）
- 用途別プリセット（行政手続き用・メール添付用・Web掲載用）
- 複数ファイル同時変換（最大10枚）・ZIPまとめダウンロード
- スマホ・PC両対応（レスポンシブ）

## ローカル起動

```bash
npm install
npm run dev
```

→ http://localhost:5173 で起動します。

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが生成されます。

## デプロイ（Cloudflare Pages）

1. GitHubにリポジトリを push
2. Cloudflare Pages → 「新しいプロジェクトを作成」
3. ビルド設定:
   - **フレームワークプリセット**: Vite
   - **ビルドコマンド**: `npm run build`
   - **ビルド出力ディレクトリ**: `dist`
4. 「保存してデプロイ」

環境変数・サーバー設定は不要です（完全静的）。

## デプロイ（Vercel）

```bash
npx vercel --prod
```

または Vercel ダッシュボードからリポジトリを連携。  
Framework Preset: **Vite** を選択すると自動設定されます。

## 技術スタック

| 役割 | ライブラリ |
|------|-----------|
| UI フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 8 |
| スタイリング | Tailwind CSS v4 |
| HEIC 変換 | heic2any |
| ZIP 生成 | jszip |

## プリセットの追加

[src/constants/presets.ts](src/constants/presets.ts) の `PRESETS` 配列に追記するだけです。

```ts
{
  id: 'sns',
  label: 'SNS投稿用',
  description: 'WebP・300KB以下',
  settings: {
    outputFormat: 'image/webp',
    quality: 0.75,
    targetSizePreset: 'custom',
    targetSizeKB: 300,
  },
},
```

## ライセンス

MIT
