import type { Todo } from '../types/todo';

// Local StorageにTODOを保存するためのキー
const STORAGE_KEY = 'todos';

/**
 * @brief TODOリストをLocal Storageに保存する
 * @param todos - 保存するTODOアイテムの配列
 * @returns なし
 */
const saveTodos = (todos: Todo[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

/**
 * @brief Local StorageからTODOリストを読み込む
 * @returns Todo[] - 読み込んだTODOアイテムの配列、または空の配列
 */
const loadTodos = (): Todo[] => {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    return storedTodos ? JSON.parse(storedTodos) : [];
};

/**
 * @brief 現在のTODOリストを取得する
 * 未完了のTODOを先に、完了済みのTODOを後に並べ替える。
 * @returns Todo[] - 並べ替えられたTODOアイテムの配列
 */
export const getTodos = (): Todo[] => {
    const todos = loadTodos();
    // 未完了のTODOを先に、完了済みのTODOを後に並べ替える
    return todos.sort((a, b) => {
        if (a.completed && !b.completed) {
            return 1; // aが完了済みでbが未完了なら、aを後ろに
        } else if (!a.completed && b.completed) {
            return -1; // aが未完了でbが完了済みなら、aを前に
        }
        return 0; // その他の場合は順序を変えない (元の順序を維持)
    });
};

/**
 * @brief 新しいTODOアイテムを追加する
 * @param text - TODOのテキスト内容
 * @param isPriority - TODOが優先されるかどうかのフラグ
 * @param dueDate - TODOの期限日（オプション）
 * @returns Todo[] - 更新されたTODOアイテムの配列
 */
export const addTodo = (text: string, isPriority: boolean, dueDate?: string): Todo[] => {
    const todos = loadTodos();
    const newTodo: Todo = {
        id: Date.now().toString(), // ユニークIDを生成
        text,
        isPriority,
        dueDate,
        completed: false,
        pomodorosCompleted: 0,
    };
    // 新しいTODOをリストの先頭に追加
    todos.unshift(newTodo);
    saveTodos(todos);
    return todos;
};

/**
 * @brief 既存のTODOアイテムを更新する
 * @param id - 更新するTODOのID
 * @param updatedFields - 更新するフィールドと新しい値のオブジェクト
 * @returns Todo[] - 更新されたTODOアイテムの配列
 */
export const updateTodo = (id: string, updatedFields: Partial<Todo>): Todo[] => {
    const todos = loadTodos();
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
        // 既存のTODOに更新フィールドをマージ
        todos[index] = { ...todos[index], ...updatedFields };
        saveTodos(todos);
    }
    return todos;
};

/**
 * @brief TODOアイテムを削除する
 * @param id - 削除するTODOのID
 * @returns Todo[] - 更新されたTODOアイテムの配列
 */
export const deleteTodo = (id: string): Todo[] => {
    const todos = loadTodos();
    // 指定されたID以外のTODOをフィルタリングして新しい配列を作成
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    return updatedTodos;
};

/**
 * @brief TODOリストのアイテムを並び替える
 * @param startIndex - ドラッグ開始時のTODOのインデックス
 * @param endIndex - ドラッグ終了時のTODOのインデックス
 * @returns Todo[] - 並び替えられたTODOアイテムの配列
 */
export const reorderTodos = (startIndex: number, endIndex: number): Todo[] => {
    const todos = loadTodos();
    // 開始インデックスから要素を1つ削除し、削除された要素を保持
    const [removed] = todos.splice(startIndex, 1);
    // 終了インデックスに削除された要素を挿入
    todos.splice(endIndex, 0, removed);
    saveTodos(todos);
    return todos;
};

/**
 * @brief TODOの完了状態をトグルする
 * @param id - 完了状態を切り替えるTODOのID
 * @returns Todo[] - 更新されたTODOアイテムの配列
 */
export const toggleTodoCompleted = (id: string): Todo[] => {
    const todos = loadTodos();
    const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
            // 完了ステータスをトグルし、新しいTODOオブジェクトを返すことでReactが変更を検知できるようにする
            return { ...todo, completed: !todo.completed };
        }
        return todo; // その他のTODOはそのまま返す
    });
    saveTodos(updatedTodos);
    return updatedTodos;
};

/**
 * @brief 指定されたTODOのポモドーロ完了回数を1増やす
 * @param id - ポモドーロ完了回数を増やすTODOのID
 * @returns Todo[] - 更新されたTODOアイテムの配列
 */
export const incrementPomodorosCompleted = (id: string): Todo[] => {
    const todos = loadTodos();
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
        todos[index].pomodorosCompleted += 1;
        saveTodos(todos);
    }
    return todos;
}; 