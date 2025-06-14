# アーキテクチャ図

## 1. システムアーキテクチャ

```mermaid
graph LR
    SubGraph "クライアントサイドアプリケーション (React + TypeScript)"
        A[App.tsx (メインコンポーネント)] --> B(components/);
        A --> C(stores/);
        A --> D(hooks/);
        A --> E(types/);
        A --> F(utils/);
    end

    B --> B1(TodoForm.tsx);
    B --> B2(TodoList.tsx);
    B --> B3(TodoItem.tsx);

    C --> C1(todoStore.ts);

    D --> D1(usePomodoroTimer.ts);

    E --> E1(todo.ts);

    F --> F1(timer.ts);

    G[LocalStorage] <--> C1;
    A <--> G;
```

### 説明
本アプリケーションは単一のクライアントサイドSPA（Single Page Application）として構築されます。サーバーサイドの機能は持ちません。すべてのデータはブラウザのLocalStorageに保存されます。

## 2. コンポーネント構成

- **`App.tsx`**: アプリケーションのルートコンポーネント。グローバルな状態管理（Recoil経由）、ルートのルーティング（もしあれば）、主要なUI要素（ヘッダー、TODOリスト、タイマー表示）のレンダリングを調整します。
- **`components/`**: 再利用可能なUIコンポーネントを格納します。
    - `TodoForm.tsx`: TODOの追加フォーム。新しいTODOのタイトル、優先度、期日を入力するUIを提供します。
    - `TodoList.tsx`: 複数の`TodoItem`コンポーネントをレンダリングするリストコンポーネント。TODOアイテムの並べ替えやフィルタリングロジックを持つ場合があります。
    - `TodoItem.tsx`: 個々のTODOアイテムの表示と操作（完了/未完了、優先度表示、期日表示、消費時間表示、削除）を処理します。
- **`stores/`**: Recoilの状態管理関連ファイルを格納します。
    - `todoStore.ts`: TODOアイテムのグローバルな状態を管理するRecoilアトムとセレクターを定義します。Local Storageとのデータの読み書きも担当します。
- **`hooks/`**: カスタムReactフックを格納します。
    - `usePomodoroTimer.ts`: ポモドーロタイマーのロジック（タイマーの開始/停止、時間管理、通知トリガー）をカプセル化したカスタムフック。UIとは分離され、バックグラウンドで動作します。
- **`types/`**: TypeScriptの型定義ファイルを格納します。
    - `todo.ts`: `Todo`オブジェクトのインターフェースや関連する型定義を定義します。
- **`utils/`**: ユーティリティ関数やヘルパー関数を格納します。
    - `timer.ts`: タイマーのフォーマットやその他の時間関連のヘルパー関数を提供します。

## 3. 依存関係

- **`App.tsx`**: `components/`以下の各コンポーネント、`stores/todoStore.ts`、`hooks/usePomodoroTimer.ts`に依存します。
- **`TodoForm.tsx`**: `App.tsx`から渡されるTODO追加関数に依存します。
- **`TodoList.tsx`**: `stores/todoStore.ts`からTODOリストの状態を読み込み、`TodoItem.tsx`をレンダリングします。
- **`TodoItem.tsx`**: `stores/todoStore.ts`からTODOの更新や削除のアクションに依存します。また、`types/todo.ts`の型定義に依存します。
- **`todoStore.ts`**: LocalStorage APIに依存し、データの永続化を行います。`types/todo.ts`に依存します。
- **`usePomodoroTimer.ts`**: `utils/timer.ts`に依存し、時間関連のユーティリティ関数を利用します。