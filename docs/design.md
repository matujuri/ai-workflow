# 設計書

## 1. システム構成図

```mermaid
graph TD
    User[ユーザー] --> |Webブラウザ| Frontend(フロントエンド);
    Frontend --> |データの保存/読み込み| LocalStorage[ローカルストレージ];
```

### 説明
本アプリケーションはクライアントサイドのみで動作し、ユーザーインターフェースはReactとTypeScriptで構築されます。データの永続化にはブラウザのLocalStorageを使用します。

## 2. クラス図 (主要コンポーネント)

```mermaid
classDiagram
    class App {
        +todos: Todo[]
        +editingTodo: Todo | null
        +activeTodoId: string | null
        +time: number
        +isRunning: boolean
        +isWorking: boolean
        +showTodoForm: boolean
        +handleAddTodo(text: string, priority: boolean, dueDate?: string)
        +handleToggleCompleted(id: string)
        +handleDelete(id: string)
        +handleUpdateTodo(id: string, text: string, priority: boolean, dueDate?: string)
        +handleStartEdit(todo: Todo)
        +handleCancelEdit()
        +handleSort(oldIndex: number, newIndex: number)
        +handleResetPomodoro()
        +handleSetAsActiveTodo(id: string)
        +toggleTodoFormVisibility()
    }

    class TodoForm {
        +onAddTodo(text: string, priority: boolean, dueDate?: string)
        +onEditTodo(id: string, text: string, priority: boolean, dueDate?: string)
        +editingTodo: Todo | null
        +onCancelEdit()
    }

    class TodoList {
        +todos: Todo[]
        +onToggleCompleted(id: string)
        +onDelete(id: string)
        +onStartEdit(todo: Todo)
        +onSort(oldIndex: number, newIndex: number)
        +activeTodoId: string | null
        +onSetAsActiveTodo(id: string)
        +time: number
        +WORK_TIME: number
        +isWorking: boolean
    }

    class TodoItem {
        +todo: Todo
        +onToggleCompleted(id: string)
        +onDelete(id: string)
        +onStartEdit(todo: Todo)
        +isActive: boolean
        +onSetAsActiveTodo(id: string)
        +time: number
        +WORK_TIME: number
        +isWorking: boolean
    }

    class PomodoroTimer {
        +time: number
        +isRunning: boolean
        +isWorking: boolean
        +startTimer(): void
        +pauseTimer(): void
        +toggleMode(): void
        +onResetClick(): void
    }

    class TodoStore {
        +todos: Todo[]
        +getTodos(): Todo[]
        +saveTodos(todos: Todo[]): void
        +addTodo(text: string, priority: boolean, dueDate?: string): Todo[]
        +toggleTodoCompleted(id: string): Todo[]
        +deleteTodo(id: string): Todo[]
        +updateTodo(id: string, updates: Partial<Todo>): Todo[]
        +reorderTodos(oldIndex: number, newIndex: number): Todo[]
        +incrementPomodorosCompleted(id: string): Todo[]
    }

    class UsePomodoroTimerHook {
        +time: number
        +isRunning: boolean
        +isWorking: boolean
        +startTimer(): void
        +pauseTimer(): void
        +resetTimer(): void
        +toggleMode(): void
        +WORK_TIME: number
        +BREAK_TIME: number
        +isBreakTimerActive: boolean
        +breakTimeRemaining: number
    }

    class TodoType {
        +id: string
        +text: string
        +completed: boolean
        +pomodorosCompleted: number
        +priority: boolean
        +dueDate?: string
    }

    App -- TodoForm
    App -- TodoList
    App -- PomodoroTimer
    App ..> UsePomodoroTimerHook
    App ..> TodoStore
    TodoList -- TodoItem
    TodoItem ..> TodoType
    TodoForm ..> TodoType
    TodoStore ..> TodoType
    TodoStore -- LocalStorage
    UsePomodoroTimerHook ..> TimerUtils

    note for App "TODO追加フォーム表示/非表示、
    日付表示、休憩タイマー残り時間表示を制御"
    note for TodoForm "優先度(yes/no)と期日入力に対応"
    note for TodoItem "優先度による「！」表示、
    期日表示、消費時間(x/Nx)表示に対応"
    note for PomodoroTimer "UIは非表示、ロジックのみ"
    note for UsePomodoroTimerHook "25分タイマー完了後の自動休憩開始を停止、
    休憩タイマーの残り時間を公開"
    note for TodoType "priority: boolean, dueDate?: string, timeSpent: number を追加"

```

### 説明
- `TodoApp`: アプリケーションのメインコンポーネント。日付表示、TODOフォームの表示/非表示、タイマー残り時間の表示を管理します。
- `TodoForm`: TODOの追加を担当します。優先度と期日も入力できるように変更されます。
- `TodoList`: TODOアイテムのリストを表示します。
- `TodoItem`: 個々のTODOアイテムを表示します。優先度、期日、消費時間の表示ロジックが追加されます。
- `PomodoroTimer`: ポモドーロタイマーのロジックを含みますが、UIは表示されません。バックグラウンドで動作し、完了イベントを`TodoApp`に通知します。

## 3. シーケンス図 (TODO追加フォーム表示)

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant TA as TodoApp

    U->>TA: 空きスペースをクリック
    TA->>TA: `toggleTodoForm()` を呼び出し
    TA->>TA: `showTodoForm` の状態を切り替え
    TA-->>U: TODO追加フォームの表示/非表示を更新
```

## 4. シーケンス図 (25分タイマー完了後の挙動)

```mermaid
sequenceDiagram
    participant PT as PomodoroTimer
    participant TA as TodoApp
    participant U as ユーザー

    PT->>TA: 25分タイマー完了イベント通知
    TA->>TA: タイマーの状態をリセット (5分タイマーを開始しない)
    U->>TA: TODOエリアをクリック
    TA->>TA: 25分タイマーを再開
```

## 5. データフロー図 (TODOアイテム)

```mermaid
graph TD
    subgraph UI
        TF[TodoForm] --> |入力データ| TA(TodoApp);
        TA --> |表示データ| TL[TodoList];
        TL --> |個々のTODO| TI[TodoItem];
    end

    TA --> |保存/読み込み| LS[LocalStorage];
    LS --> |データ| TI;
```

### 説明
- `TodoForm`からの入力データは`TodoApp`を介して`LocalStorage`に保存されます。
- `LocalStorage`から読み込まれたデータは`TodoApp`を通じて`TodoList`、`TodoItem`に渡され、表示されます。

## 6. シーケンス図 (主要な流れ)

### 6.1 TODO追加シーケンス
1. ユーザーがTODO入力フィールドにテキストを入力し、「追加」ボタンをクリックする。
2. `TodoForm` コンポーネントが入力値を取得し、`App.tsx`の`handleAddTodo`を呼び出す。
3. `App.tsx`が`todoStore.addTodo`を呼び出し、新しいTODOアイテムを状態に追加し、Local Storageに保存する。
4. `App.tsx`の状態更新により、`TodoList` コンポーネントに新しいTODOアイテムがプロップスとして渡され、リストに表示される。

### 6.2 ポモドーロ開始・終了・モード切り替えシーケンス
1. ユーザーが未完了のTODOアイテムをクリックする。
2. `TodoItem` コンポーネントがクリックイベントを検知し、`App.tsx`の`handleSetAsActiveTodo`を呼び出す。
3. `App.tsx`の`handleSetAsActiveTodo`は、現在アクティブなTODOを管理し、`usePomodoroTimer`フックのタイマー操作（`startTimer`, `pauseTimer`, `resetTimer`, `toggleMode`）を制御する。
    - **タイマーが停止中の場合（初回またはリセット後）**: `activeTodoId`を設定し、`resetTimer()`でタイマーを作業時間（25分）にリセットし、`startTimer()`で作業タイマーを開始する。TODOの横にタイマーの進捗を示すUIが表示される。
    - **タイマーが実行中の場合**: `pauseTimer()`でタイマーを一時停止する。
    - **タイマーが一時停止中の場合**: `startTimer()`でタイマーを再開する。
    - **作業時間が終了した場合（`time === 0` かつ `isWorking` が `true`）**: `todoStore.incrementPomodorosCompleted(id)`を呼び出し、該当TODOのポモドーロ完了回数を増やす。その後、`toggleMode()`で休憩モードに切り替え、`startTimer()`で休憩タイマー（5分）を開始する。
    - **休憩時間が終了した場合（`time === 0` かつ `isWorking` が `false`）**: `toggleMode()`で作業モードに切り替える。タイマーは自動で再開せず、ユーザーのクリックを待つ。
4. `usePomodoroTimer`フックがタイマーのカウントダウンを行い、残り時間（`time`）、実行状態（`isRunning`）、モード（`isWorking`）を管理する。
5. `App.tsx`は`usePomodoroTimer`フックからこれらの状態を受け取り、`PomodoroTimer`コンポーネントと`TodoList`/`TodoItem`コンポーネントにプロップスとして渡す。
6. `PomodoroTimer`コンポーネントは現在のタイマー状態を表示し、`TodoList`/`TodoItem`コンポーネントはTODOアイテムごとにタイマーの進捗UI（円やポモドーロ完了回数）を更新して表示する。
    - **通知について**: タイマー終了時に音とポップアップ通知がトリガーされる。

## 7. データフロー図

### 7.1 データ保存・更新フロー
- **ユーザー入力**: ユーザーがUIを操作し、TODOの追加・編集・削除、**ポモドーロの開始・休憩・再開**を行う。
- **Reactコンポーネント**: `TodoForm` や `TodoItem` などのコンポーネントがユーザー入力を受け付け、必要なデータを整形する。
- **`TodoStore`**: 整形されたデータは `TodoStore` に渡され、内部のTODOリストが更新される。**特にTODOごとのポモドーロ完了回数（`pomodorosCompleted`）が更新される。** また、Local Storageへの永続化処理も `TodoStore` が担当する。
- **Local Storage**: `TodoStore` によってデータが読み書きされ、ブラウザのローカルストレージに保存される。

### 7.2 タイマー・UI更新フロー
- **ユーザー操作**: **TODOアイテムのクリック**により、タイマーの開始・休憩への切り替え・次の作業への再開がトリガーされる。
- **タイマーロジック**: `usePomodoroTimer` hook がタイマーのカウントダウン、作業/休憩時間の管理、通知トリガーを制御する。
- **Reactコンポーネント**: `PomodoroTimer` や `TodoItem` などのコンポーネントが `usePomodoroTimer` hook からタイマーの状態（残り時間、アクティブ状態、作業/休憩状態）を受け取り、UIを更新する。
- **UI表示**: 更新されたタイマーの残り時間、TODOの進捗円、ポモドーロ完了回数などがユーザーインターフェースに反映される。現在、タイマー終了時の音やポップアップ通知は含まれていない。 