# 技術スタック一覧

## 1. 使用する言語、フレームワーク、ライブラリ

### 1.1 フロントエンド
- **言語**: TypeScript
- **フレームワーク**: React
- **ビルドツール**: Vite
- **状態管理**: Recoil
- **スタイリング**: Tailwind CSS

### 1.2 データ永続化
- **ストレージ**: Local Storage (ブラウザのローカルストレージ)

## 2. バージョン情報 (開発開始時の想定)
- Node.js: 最新LTSバージョン
- npm/yarn: 最新バージョン
- React: 最新安定バージョン
- Vite: 最新安定バージョン
- TypeScript: 最新安定バージョン
- Tailwind CSS: 最新安定バージョン

## 3. 選択理由
- **TypeScript**: 型安全な開発を促進し、大規模なアプリケーションでの保守性を向上させるため。
- **React**: コンポーネントベースのUI開発に適しており、宣言的なUI構築が可能であるため。
- **Recoil**: 軽量でReactに特化した状態管理ライブラリであり、既存プロジェクトで採用されているため。
- **Tailwind CSS**: ユーティリティファーストのアプローチにより、高速なUI開発と一貫性のあるデザインを実現できるため。
- **Vite**: 高速な開発サーバーとビルド速度により、開発効率を向上させる。
- **Local Storage**: ユーザー登録機能がないため、ブラウザ内での手軽なデータ永続化に適している。
- 全ての技術はオープンソースであり、無料で利用可能であるため、開発コストを抑えられる。

## 4. 補足事項
### ViteとTailwind CSSの併用における注意点
- **Tailwind CSS v4以降の推奨設定**: `postcss.config.js` は不要となり、`vite.config.ts` で `@tailwindcss/vite` プラグインを使用するのが推奨される。
- **CSSのインポート**: `src/index.css` には `@import "tailwindcss";` のみを記述し、`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` は含めない。
- **バージョンの一貫性**: `@tailwindcss/vite`, `@tailwindcss/postcss`, `tailwindcss` など、関連するTailwind CSSパッケージのバージョンは一致させる必要がある。バージョン不一致は予期せぬエラーの原因となる。

### Vitestの適用における注意点
- **インストール**: `vitest` と `@vitest/coverage-v8` を開発依存としてインストールする。
- **`package.json`**: `scripts` セクションに `"test": "vitest"` を追加する。
- **`vite.config.ts`**: 
  - `defineConfig` を `vitest/config` からインポートする。
  - `test` オブジェクトに `globals: true` を追加し、グローバルAPI（`describe`, `it`, `expect`など）を有効にする。
  - DOM操作を含むテストを実行する場合、`environment: 'jsdom'` を追加する。
  - `include` オプションでテストファイルの命名パターン（例: `'tests/test_*.ts'`）を正確に指定する。
- **`tsconfig.app.json`**: 
  - `compilerOptions.types` に `"vitest/globals"` を追加し、グローバルAPIの型定義を認識させる。
  - `include` にテストファイルが存在するディレクトリ（例: `"tests"`）を追加する。
- **テストコード**: テストのたびに状態が変わる可能性のある機能（例: `Date.now()`）は、`vi.spyOn` などで適切にモック化し、テストの独立性と再現性を保つ。

## 5. 既知の課題と解決策

### 5.1 TODOアイテムのボタン（編集・削除）とチェックボックスのクリック無反応、および完了表示の問題
- **課題**: TODOアイテムの「Edit」ボタン、「Delete」ボタンをクリックしても反応せず、チェックボックスが完了状態になっても切り替わらず、完了済みTODOの表示（星マーク、太字、打ち消し線）が正しく適用されない。
- **原因**: ドラッグ＆ドロップライブラリ (`@dnd-kit/core`) のイベントリスナーが、TODOアイテム全体のクリックイベントを捕捉してしまい、内部のボタンやチェックボックスのイベントが発火しなかった。
- **解決策**: DND-kitの`useSortable`フックから取得した`attributes`と`listeners`を、ドラッグハンドルとして機能する特定の要素（例: `::` を表示する`<span>`タグ）にのみ適用するように変更。これにより、ドラッグ操作とクリック操作が競合せず、ボタンやチェックボックスのイベントが適切に処理されるようになった。 