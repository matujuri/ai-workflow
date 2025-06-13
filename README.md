# ポモドーロTODO

## プロジェクト概要

このプロジェクトは、ユーザーがタスクを効率的に管理し、集中力を高めるためのポモドーロタイマー機能を統合したTODOリストアプリケーションです。ReactとTypeScriptを基盤に構築されており、Viteによる高速な開発体験とTailwind CSSによる柔軟なスタイリングを提供します。TODOデータはブラウザのLocal Storageに保存され、永続化されます。

## 使用技術（Tech Stack）

-   **フロントエンド**: React, TypeScript, Vite, Tailwind CSS
-   **状態管理**: ReactのuseState, useEffect, useContext (将来的にはReduxやZustandなどの導入も検討)
-   **データ永続化**: Local Storage
-   **テスト**: Vitest (ユニットテスト、コンポーネントテスト)
-   **DND**: `@dnd-kit/core`, `@dnd-kit/sortable`

## 主な機能

-   **TODOリスト管理**:
    -   TODOの追加、編集、削除
    -   TODOの完了状態のトグル
    -   優先度（高・中・低）と期日の設定
    -   ドラッグ＆ドロップによるTODOの並び替え
    -   完了済みのTODOはリストの下部に自動的に移動
-   **ポモドーロタイマー**:
    -   TODOアイテムのタイトルをクリックしてポモドーロタイマー（25分作業）を開始
    -   作業時間終了後に通知（音とポップアップ）
    -   ユーザーがクリックすることで休憩タイマー（5分休憩）を開始
    -   ポモドーロ完了回数の表示（`x`マーク）と永続化
    -   休憩時間中の進捗円の非表示
    -   タイマーリセット時に進捗円を非表示

## 開発環境のセットアップ

### 前提条件

-   Node.js (v18以上を推奨)
-   npm または Yarn

### インストール

1.  リポジトリをクローンします:
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd ai-workflow
    ```
2.  依存関係をインストールします:
    ```bash
    npm install
    # または
    yarn install
    ```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで `http://localhost:5173` (または指定されたポート) にアクセスすると、アプリケーションが表示されます。

## テストの実行

```bash
npm run test
# または
yarn test
```

## ビルド

本番環境向けにアプリケーションをビルドします:

```bash
npm run build
# または
yarn build
```

ビルドされたファイルは `./dist` ディレクトリに生成されます。
