# 開発ワークフローステート（workflow_state.md）  
_Last updated: 2025-06-12_

## ステート（State）
- フェーズ（Phase）: CONSTRUCT  
- ステータス（Status）: RUNNING  
- 現在の作業項目（CurrentItem）: fix-pomodoro-x-increment

---

## 計画（Plan）

- タイトル: アプリケーションヘッダーの日付と曜日表示への変更
  - 対象ファイル: `src/App.tsx`, `src/utils/dateUtils.ts` (新規作成)
  - 作業内容:
    - `src/utils/dateUtils.ts` に現在の日付と曜日をフォーマットする関数を作成する。
    - `src/App.tsx` のヘッダーでこの関数を使用してタイトルを更新する。
  - テスト要件:
    - ロジックテスト: 現在の日付と曜日が正しいフォーマットで表示されること。
    - 要件テスト: "My Todos"ではなく、日付と曜日が表示されること。
  - テストファイル: `tests/test_App.ts`

- タイトル: TODO追加フォームのデフォルト非表示とクリック表示切り替え
  - 対象ファイル: `src/App.tsx`, `src/components/TodoForm.tsx`
  - 作業内容:
    - `src/App.tsx` に `showTodoForm` 状態を導入し、デフォルトで `false` に設定する。
    - TODOリストの空きスペースをクリックしたときに `showTodoForm` を切り替えるハンドラーを追加する。
    - `TodoForm.tsx` を `showTodoForm` の状態に基づいて表示/非表示にする。
  - テスト要件:
    - ロジックテスト: デフォルトでTODO追加フォームが非表示であること。
    - ロジックテスト: TODO画面の空きスペースをクリックするとフォームが表示されること。
    - ロジックテスト: フォームが表示されている状態で再度クリックすると非表示になること。
  - テストファイル: `tests/test_App.ts`, `tests/test_TodoForm.ts`

- タイトル: ポモドーロタイマーUIの非表示
  - 対象ファイル: `src/App.tsx`, `src/components/PomodoroTimer.tsx`
  - 作業内容:
    - `src/App.tsx` から `PomodoroTimer` コンポーネントのレンダリングを削除する。
  - テスト要件:
    - ロジックテスト: `PomodoroTimer.tsx` コンポーネントがレンダリングされないこと。
  - テストファイル: `tests/test_App.ts`

- タイトル: 25分タイマー完了後の自動休憩タイマー停止と再開ロジック変更
  - 対象ファイル: `src/hooks/usePomodoroTimer.ts`, `src/App.tsx`
  - 作業内容:
    - `usePomodoroTimer.ts` のロジックを修正し、25分タイマー完了後に5分タイマーに自動で移行しないようにする。
    - `App.tsx` でTODOエリアクリック時に25分タイマーを再開するロジックを追加する。
  - テスト要件:
    - ロジックテスト: 25分タイマー完了後、5分タイマーに移行しないこと。
    - ロジックテスト: 進捗円（またはTODOエリア）をクリックすると25分タイマーが再開すること。
  - テストファイル: `tests/test_usePomodoroTimer.ts`

- タイトル: 5分タイマー作動中の残り時間表示
  - 対象ファイル: `src/App.tsx`, `src/hooks/usePomodoroTimer.ts`
  - 作業内容:
    - `usePomodoroTimer.ts` で5分タイマーが動作しているかどうかと残り時間を公開する。
    - `src/App.tsx` で5分タイマーが動作している場合にのみ、画面上部に残り時間を表示する。
  - テスト要件:
    - ロジックテスト: 5分タイマーが動作している時のみ、TODO画面上部に残り時間が表示されること。
    - ロジックテスト: 5分タイマーが停止している時は残り時間が表示されないこと。
    - ロジックテスト: 表示される残り時間が正しいフォーマットであること。
  - テストファイル: `tests/test_App.ts`, `tests/test_usePomodoroTimer.ts`

- タイトル: TODOの消費時間表示フォーマット変更
  - 対象ファイル: `src/components/TodoItem.tsx`, `src/types/todo.ts`
  - 作業内容:
    - `TodoItem.tsx` で `timeSpent` の表示ロジックを修正し、1の場合は 'x'、2以上の場合は 'Nx' (Nは個数) と表示する。
  - テスト要件:
    - ロジックテスト: 消費時間が1の場合、「x」と表示されること。
    - ロジックテスト: 消費時間が2以上の場合、「Nx」（Nは個数）と表示されること。
    - ロジックテスト: 消費時間が0の場合、何も表示されないこと。
  - テストファイル: `tests/test_TodoItem.ts`

- タイトル: 優先度選択をyes/noの二択に限定
  - 対象ファイル: `src/types/todo.ts`, `src/components/TodoForm.tsx`
  - 作業内容:
    - `todo.ts` の `priority` 型を `boolean` に変更する。
    - `TodoForm.tsx` の優先度入力フィールドを `yes/no` の選択肢を持つものに修正する。
  - テスト要件:
    - ロジックテスト: 優先度入力が「はい/いいえ」の二択であること。
  - テストファイル: `tests/test_TodoForm.ts`

- タイトル: 優先度によるTODOタイトル前「！」表示
  - 対象ファイル: `src/components/TodoItem.tsx`
  - 作業内容:
    - `TodoItem.tsx` で `priority` が `true` の場合、TODOタイトル前に「！」を表示する。
  - テスト要件:
    - ロジックテスト: 「はい」の場合のみTODOタイトル前に「！」が表示されること。
    - ロジックテスト: 「いいえ」の場合、「！」が表示されないこと。
  - テストファイル: `tests/test_TodoItem.ts`

- タイトル: TODOアイテムへの期日表示追加
  - 対象ファイル: `src/types/todo.ts`, `src/components/TodoForm.tsx`, `src/components/TodoItem.tsx`
  - 作業内容:
    - `todo.ts` に `dueDate` プロパティ (型: `Date` または `string`) を追加する。
    - `TodoForm.tsx` に期日入力フィールドを追加する。
    - `TodoItem.tsx` で期日をTODOタイトルの下の行に小さめのフォントで表示する。
  - テスト要件:
    - ロジックテスト: 期日を入力できるフィールドがあること。
    - ロジックテスト: 期日がTODOタイトルの下の行に小さめに表示されること。
    - 境界値テスト: 期日が設定されていない場合、表示されないこと。
    - 境界値テスト: 無効な期日が入力された場合の挙動。
  - テストファイル: `tests/test_TodoForm.ts`, `tests/test_TodoItem.ts`

- タイトル: 新規TODOをリストの最上位に追加
  - 対象ファイル: `src/stores/todoStore.ts`
  - 作業内容: `addTodo` 関数を修正し、新しいTODOを既存のTODOリストの先頭に追加するように変更する。
  - テスト要件:
    - ロジックテスト: 新しく追加されたTODOがリストの一番上に表示されること。
  - テストファイル: `tests/test_todoStore.ts`

- タイトル: TODO画面の高さをデバイス画面いっぱいに調整
  - 対象ファイル: `src/App.tsx`
  - 作業内容: メインコンテナのCSS（例: `min-h-screen`や`h-screen`）を調整し、TODO画面が常にデバイスの画面全体を占めるようにする。
  - テスト要件:
    - 要件テスト: TODO画面がデバイス画面いっぱいに表示されること。
  - テストファイル: `tests/test_App.ts`

- タイトル: 「Edit」ボタンクリック時にTODOフォームを表示
  - 対象ファイル: `src/App.tsx`, `src/components/TodoItem.tsx`
  - 作業内容: `src/App.tsx` の `handleStartEdit` 関数内で `showTodoForm` ステートを `true` に設定するように変更する。
  - テスト要件:
    - ロジックテスト: 「Edit」ボタンをクリックするとTODOフォームが表示され、編集中のTODOがフォームにロードされること。
  - テストファイル: `tests/test_App.ts`, `tests/test_TodoItem.ts`

- タイトル: 優先度選択のラベルと選択肢の確認
  - 対象ファイル: `src/components/TodoForm.tsx`
  - 作業内容: 現在の実装が「優先（はい）」と「しない（いいえ）」の選択肢とラベルになっていることを確認し、必要に応じて修正する。
  - テスト要件:
    - 要件テスト: 優先度選択のラベルが「優先」であり、選択肢が「はい」と「いいえ」であることを確認する。
  - テストファイル: `tests/test_TodoForm.ts`

- タイトル: TODOアイテムの期日表示を別行に移動
  - 対象ファイル: `src/components/TodoItem.tsx`
  - 作業内容: `src/components/TodoItem.tsx` で期日 (`todo.dueDate`) の表示位置をTODOタイトルの次の行に移動し、小さめのフォントで表示する。
  - テスト要件:
    - 要件テスト: 期日がTODOタイトルのすぐ下の行に表示されること。
    - 要件テスト: 期日が小さめのフォントで表示されること。
  - テストファイル: `tests/test_TodoItem.ts`

- タイトル: ポモドーロ作業時間完了後の挙動調整
  - 対象ファイル: `src/App.tsx`, `src/hooks/usePomodoroTimer.ts`, `src/components/TodoItem.tsx`
  - 作業内容: ポモドーロ作業時間が完了後も進捗円をそのままにし、進捗円クリックで`x`が増加し、休憩タイマーが開始されるようにする。休憩タイマー中は画面上部にカウントダウンを表示する。
  - テスト要件:
    - ロジックテスト: 25分タイマー完了後も進捗円が残ること。
    - ロジックテスト: 進捗円クリックで`x`が増えること。
    - ロジックテスト: 進捗円クリックで休憩タイマーが開始され、画面上部にカウントダウンが表示されること。
  - テストファイル: `tests/test_App.ts`, `tests/test_usePomodoroTimer.ts`, `tests/test_TodoItem.ts`

- タイトル: TODO新規追加フォームの表示位置変更
  - 対象ファイル: `src/App.tsx`
  - 作業内容: TODO追加フォームをTODOリストの最下部に移動する。
  - テスト要件:
    - 要件テスト: 新規TODO追加フォームがリストの一番下に表示されること。
  - テストファイル: `tests/test_App.ts`

- タイトル: TODO編集フォームの表示位置変更
  - 対象ファイル: `src/App.tsx`, `src/components/TodoList.tsx`, `src/components/TodoItem.tsx`
  - 作業内容: TODO編集フォームを該当TODOの直下に表示する。
  - テスト要件:
    - 要件テスト: 「Edit」ボタンクリック時、編集フォームが該当TODOの直下に表示されること。
  - テストファイル: `tests/test_App.ts`, `tests/test_TodoList.ts`, `tests/test_TodoItem.ts`

- タイトル: 進捗円とEdit/Deleteボタンの表示調整
  - 対象ファイル: `src/components/TodoItem.tsx`
  - 作業内容: 進捗円は常に表示されるようにし、Edit/Deleteボタンはデフォルトで非表示にし、TODOアイテムにホバーした場合のみ表示するようにする。
  - テスト要件:
    - ロジックテスト: 通常時、Edit/Deleteボタンが非表示であること。
    - ロジックテスト: TODOアイテムにホバーするとEdit/Deleteボタンが表示されること。
    - ロジックテスト: 進捗円は常に表示されること。
  - テストファイル: `tests/test_TodoItem.ts`

- タイトル: ポモドーロ完了後のx増加と休憩タイマー開始の修正
  - 対象ファイル: `src/App.tsx`, `src/hooks/usePomodoroTimer.ts`
  - 作業内容: 作業時間が完了した後に進捗円をクリックした際に、ポモドーロ完了数(`x`)が正しく増加し、休憩タイマーが開始されるように修正する。
  - テスト要件:
    - ロジックテスト: 作業時間完了後、進捗円をクリックすると`x`が増加すること。
    - ロジックテスト: `x`増加後、休憩タイマーが開始されること。
    - ロジックテスト: 休憩タイマー中に残り時間が表示されること。
  - テストファイル: `tests/test_App.ts`, `tests/test_usePomodoroTimer.ts`

---

## 作業項目リスト（Items）
| id | 説明 | ステータス |
|----|------|------------|
| update-title-display | アプリケーションヘッダーの日付と曜日表示への変更 | COMPLETED |
| control-todo-form-visibility | TODO追加フォームのデフォルト非表示とクリック表示切り替え | COMPLETED |
| hide-pomodoro-timer-ui | ポモドーロタイマーUIの非表示 | COMPLETED |
| update-timer-behavior | 25分タイマー完了後の自動休憩タイマー停止と再開ロジック変更 | COMPLETED |
| display-break-timer-countdown | 5分タイマー作動中の残り時間表示 | COMPLETED |
| format-time-spent | TODOの消費時間表示フォーマット変更 | COMPLETED |
| limit-priority-selection | 優先度選択をyes/noの二択に限定 | COMPLETED |
| display-priority-indicator | 優先度によるTODOタイトル前「！」表示 | COMPLETED |
| add-due-date-display | TODOアイテムへの期日表示追加 | COMPLETED |
| add-new-todo-to-top | 新規TODOをリストの最上位に追加 | COMPLETED |
| adjust-screen-height | TODO画面の高さをデバイス画面いっぱいに調整 | COMPLETED |
| show-form-on-edit | 「Edit」ボタンクリック時にTODOフォームを表示 | COMPLETED |
| verify-priority-selection | 優先度選択のラベルと選択肢の確認 | COMPLETED |
| move-due-date-display | TODOアイテムの期日表示を別行に移動 | COMPLETED |
| adjust-pomodoro-behavior | ポモドーロ作業時間完了後の挙動調整 | COMPLETED |
| move-add-todo-form | TODO新規追加フォームの表示位置変更 | COMPLETED |
| move-edit-todo-form | TODO編集フォームの表示位置変更 | COMPLETED |
| hide-edit-delete-buttons | 進捗円とEdit/Deleteボタンの表示調整 | COMPLETED |
| fix-pomodoro-x-increment | ポモドーロ完了後のx増加と休憩タイマー開始の修正 | RUNNING |