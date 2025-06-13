import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/todo';

/**
 * @interface TodoFormProps
 * @brief TodoFormコンポーネントのプロパティ定義
 * @param onAddTodo - TODOを追加するコールバック関数
 * @param onEditTodo - TODOを編集するコールバック関数
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param onCancelEdit - 編集キャンセル時のコールバック関数
 */
interface TodoFormProps {
    onAddTodo: (text: string, priority: Todo['priority'], dueDate?: string) => void;
    onEditTodo: (id: string, text: string, priority: Todo['priority'], dueDate?: string) => void;
    editingTodo?: Todo | null; // 編集中のTODOを受け取る
    onCancelEdit: () => void; // 編集キャンセル時のコールバック
}

/**
 * @brief TODOの追加・編集フォームコンポーネント
 * @param props - TodoFormPropsで定義されたプロパティ
 */
const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo, onEditTodo, editingTodo, onCancelEdit }) => {
    // 入力テキストの状態
    const [inputText, setInputText] = useState('');
    // 優先度の状態
    const [priority, setPriority] = useState<Todo['priority']>('medium');
    // 期日の状態
    const [dueDate, setDueDate] = useState<string>('');

    /**
     * @brief editingTodoプロパティの変更を監視し、フォームの値を更新する副作用
     * editingTodoが存在すればその値でフォームを初期化し、なければリセットする。
     */
    useEffect(() => {
        if (editingTodo) {
            setInputText(editingTodo.text);
            setPriority(editingTodo.priority);
            setDueDate(editingTodo.dueDate || '');
        } else {
            setInputText('');
            setPriority('medium');
            setDueDate('');
        }
    }, [editingTodo]); // editingTodoが変更されたときに実行

    /**
     * @brief フォーム送信時のハンドラ
     * 新規TODOの追加または既存TODOの更新を行う。
     * @param e - Reactのフォームイベントオブジェクト
     * @returns なし
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // デフォルトのフォーム送信を防ぐ
        if (inputText.trim()) { // 入力テキストが空でないことを確認
            if (editingTodo) {
                // 編集モードの場合、onEditTodoを呼び出す
                onEditTodo(editingTodo.id, inputText, priority, dueDate || undefined);
            } else {
                // 追加モードの場合、onAddTodoを呼び出す
                onAddTodo(inputText, priority, dueDate || undefined);
            }
            // フォームをリセット
            setInputText('');
            setPriority('medium');
            setDueDate('');
            onCancelEdit(); // フォーム送信後に編集状態をクリア
        }
    };

    /**
     * @brief 編集キャンセル時のハンドラ
     * フォームの値をリセットし、編集状態をクリアする。
     * @param なし
     * @returns なし
     */
    const handleCancel = () => {
        setInputText('');
        setPriority('medium');
        setDueDate('');
        onCancelEdit(); // 編集状態をクリア
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
            {/* TODOテキスト入力フィールド */}
            <input
                type="text"
                id="todo-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="新しいTODOを追加..."
                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center mb-4">
                {/* 優先度選択ドロップダウン */}
                <label htmlFor="priority-select" className="mr-2 text-sm font-medium text-gray-700">優先度:</label>
                <select
                    id="priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                </select>
                {/* 期日入力フィールド */}
                <label htmlFor="due-date-input" className="ml-4 mr-2 text-sm font-medium text-gray-700">期日:</label>
                <input
                    id="due-date-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex justify-end space-x-2">
                {/* 追加/更新ボタン */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200 min-w-[80px]"
                >
                    {editingTodo ? '更新' : '追加'}
                </button>
                {/* キャンセルボタン（編集時のみ表示）*/}
                {editingTodo && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors duration-200 min-w-[80px]"
                    >
                        キャンセル
                    </button>
                )}
            </div>
        </form>
    );
};

export default TodoForm; 