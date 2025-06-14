# 開発ワークフローステート（workflow_state.md）  
_Last updated: 2025-06-13_

## ステート（State）

| フィールド | 説明 |
|------------|------|
| `Phase` | VALIDATE |
| `Status` | COMPLETED |
| `CurrentItem` | NULL |

## 計画（Plan）

- **タイトル**: React + TypeScript + Vite + Tailwind CSSプロジェクトの初期設定
  - **対象ファイル**: `package.json`, `tailwind.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
  - **作業内容**: ViteでReact + TypeScriptプロジェクトを作成し、Tailwind CSSを設定、基本的なアプリケーション構造を確立する。
  - **依存関係**: なし
  - **テスト要件**:
    - ロジックテスト: Vite開発サーバーが正常に起動し、基本的なコンポーネントが表示されること。
    - 要件テスト: Tailwind CSSが正しく適用されていること。
    - 境界値テスト: なし
  - **テストファイル**: なし (初期設定のため)

- **タイトル**: Local Storageを利用したTODOデータ管理モジュールの実装
  - **対象ファイル**: `src/stores/todoStore.ts`, `src/types/todo.ts`
  - **作業内容**: `Todo`インターフェースの定義、TODOの追加・編集・削除・取得・保存（Local Storage）を行う関数の実装。優先度、期日、完了状態の管理機能を追加。
  - **依存関係**: 1. プロジェクトの初期設定と環境構築
  - **テスト要件**:
    - ロジックテスト: TODOのCRUD操作が正しく行えること。Local Storageへの保存と読み込みが正常に機能すること。
    - 要件テスト: TODOの優先度、期日、完了状態が正しく管理されること。
    - 境界値テスト: 空のTODOリスト、大量のTODOデータでの動作確認。
  - **テストファイル**: `tests/test_todoStore.ts`

- **タイトル**: TODOリストとDND機能のUI実装
  - **対象ファイル**: `src/components/TodoList.tsx`, `src/components/TodoItem.tsx`, `src/App.tsx`
  - **作業内容**: `todoStore`からデータを取得し表示、各TODOアイテムの表示、完了時の星マークと太字表示、ドラッグ＆ドロップによる並び替え機能の実装。
  - **依存関係**: 1. プロジェクトの初期設定と環境構築, 2. TODOデータ管理モジュールの作成
  - **テスト要件**:
    - ロジックテスト: TODOが正しくリスト表示されること。完了状態がUIに反映されること。DNDによる並び替えが正しく機能すること。
    - 要件テスト: TODOリストのUIが簡潔なノート風であること。
    - 境界値テスト: TODOが0件の場合、非常に多い場合。
  - **テストファイル**: `tests/test_TodoList.tsx`

- **タイトル**: TODOの追加・編集・削除UIの実装
  - **対象ファイル**: `src/components/TodoForm.tsx`, `src/components/TodoList.tsx`, `src/App.tsx`
  - **作業内容**: TODO追加用の入力フィールドとボタン、TODO編集用のモーダルまたはインライン編集機能、削除ボタンの実装。
  - **依存関係**: 3. TODOリスト表示コンポーネントの実装
  - **テスト要件**:
    - ロジックテスト: TODOが正しく追加・編集・削除できること。
    - 要件テスト: 入力フォームが使いやすいこと。
    - 境界値テスト: 空の入力、長すぎる入力。
  - **テストファイル**: `tests/test_TodoForm.tsx`

- **タイトル**: 25分作業・5分休憩タイマーロジックの実装
  - **対象ファイル**: `src/hooks/usePomodoroTimer.ts`, `src/utils/timer.ts`
  - **作業内容**: タイマーの開始・停止ロジック、残り時間の計算、作業時間と休憩時間の切り替えロジック、通知（音、ポップアップ）のトリガーの実装。
  - **依存関係**: 1. プロジェクトの初期設定と環境構築
  - **テスト要件**:
    - ロジックテスト: タイマーが正確にカウントダウンすること。作業時間から休憩時間への切り替え、自動停止が機能すること。
    - 要件テスト: 25分作業、5分休憩の時間が正しいこと。
    - 境界値テスト: タイマー開始直後、残り時間1秒。
  - **テストファイル**: `tests/test_usePomodoroTimer.ts`
  - **TODO (保留中のテスト修正)**:
    - `should reset the timer`: `result.current.time` の値が `WORK_TIME - 5` となるべき箇所で `WORK_TIME` となっているアサーションエラー。
    - `should switch to break time when work time ends`: `result.current.isWorking` が `false` となるべき箇所で `true` となっているアサーションエラー。
    - `should switch back to work time when break time ends`: `result.current.time` が `WORK_TIME` となるべき箇所で `BREAK_TIME` となっているアサーションエラー。

- **タイトル**: タイマーUIとTODO連携、進捗円の実装
  - **対象ファイル**: `src/components/PomodoroTimer.tsx`, `src/components/TodoItem.tsx`, `src/App.tsx`
  - **作業内容**: タイマー表示UI、開始ボタン、TODOアイテム横の進捗円（25分）、25分後の×マーク、休憩開始トリガーのUI実装。通知UI。
  - **依存関係**: 4. TODO追加・編集・削除機能のUI実装, 5. ポモドーロタイマー機能のロジック実装
  - **テスト要件**:
    - ロジックテスト: タイマーUIが残り時間を正確に表示すること。TODOクリックで進捗円が表示・変化すること。休憩が開始されること。
    - 要件テスト: タイマーUIが簡潔であること。音とポップアップ通知が機能すること。
    - 境界値テスト: タイマーが0になったときの表示。
  - **テストファイル**: `tests/test_PomodoroTimer.tsx`

- **タイトル**: アプリケーション全体の統合とレスポンシブデザイン対応
  - **対象ファイル**: `src/App.tsx`, `src/index.css`, 各コンポーネントのCSS
  - **作業内容**: 全てのコンポーネントを統合し、レイアウト調整、全体的なスタイリング、レスポンシブデザインに対応させる。
  - **依存関係**: 6. ポモドーロタイマーUIとTODO連携の実装
  - **テスト要件**:
    - ロジックテスト: なし (主にUI/UX)
    - 要件テスト: PCとスマートフォンで適切に表示されること。簡潔なノート風のUI/UXが実現されていること。
    - 境界値テスト: なし
  - **テストファイル**: なし (主にUI/UXの目視確認)

## 作業項目リスト（Items）
| id | 説明 | ステータス |
|----|------|------------|
| project-setup | React + TypeScript + Vite + Tailwind CSSプロジェクトの初期設定 | COMPLETED |
| todo-data-management | Local Storageを利用したTODOデータ管理モジュールの実装 | COMPLETED |
| todo-list-ui | TODOリストとDND機能のUI実装 | COMPLETED |
| todo-crud-ui | TODOの追加・編集・削除UIの実装 | COMPLETED |
| pomodoro-timer-logic | 25分作業・5分休憩タイマーロジックの実装 | COMPLETED |
| pomodoro-timer-ui-todo-integration | タイマーUIとTODO連携、進捗円の実装 | COMPLETED |
| app-integration-responsive | アプリケーション全体の統合とレスポンシブデザイン対応 | COMPLETED |