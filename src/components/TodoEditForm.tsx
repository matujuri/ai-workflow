import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/todo';

/**
 * @interface TodoEditFormProps
 * @brief TodoEditFormコンポーネントのプロパティ定義
 * @param onEditTodo - TODOを編集するコールバック関数
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param onCancelEdit - 編集キャンセル時のコールバック関数
 */
interface TodoEditFormProps {
    onEditTodo: (id: string, text: string, isPriority: boolean, dueDate?: string) => void;
    editingTodo?: Todo | null; // 編集中のTODOを受け取る
    onCancelEdit: () => void; // 編集キャンセル時のコールバック
}

/**
 * @brief TODOの編集フォームコンポーネント
 * @param props - TodoEditFormPropsで定義されたプロパティ
 */
const TodoEditForm = React.forwardRef<HTMLFormElement, TodoEditFormProps>(({ onEditTodo, editingTodo, onCancelEdit }, ref) => {
    // 入力テキストの状態
    const [inputText, setInputText] = useState('');
    // 優先度の状態
    const [isPriority, setIsPriority] = useState<boolean>(false);
    // 期日の状態
    const [dueDate, setDueDate] = useState<string>('');

    /**
     * @brief editingTodoプロパティの変更を監視し、フォームの値を更新する副作用
     * editingTodoが存在すればその値でフォームを初期化し、なければリセットする。
     */
    useEffect(() => {
        if (editingTodo) {
            setInputText(editingTodo.text);
            setIsPriority(editingTodo.isPriority);
            setDueDate(editingTodo.dueDate || '');
        } else {
            setInputText('');
            setIsPriority(false);
            setDueDate('');
        }
    }, [editingTodo]); // editingTodoが変更されたときに実行

    /**
     * @brief フォーム送信時のハンドラ
     * 既存TODOの更新を行う。
     * @param e - Reactのフォームイベントオブジェクト
     * @returns なし
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // デフォルトのフォーム送信を防ぐ
        if (inputText.trim() && editingTodo) { // 入力テキストが空でないことを確認し、編集モードであることを確認
            // 編集モードの場合、onEditTodoを呼び出す
            onEditTodo(editingTodo.id, inputText, isPriority, dueDate || undefined);
            // フォームをリセット
            setInputText('');
            setIsPriority(false);
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
        setIsPriority(false);
        setDueDate('');
        onCancelEdit(); // 編集状態をクリア
    };

    return (
        <form onSubmit={handleSubmit} ref={ref} className="flex flex-col mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
            {/* TODOテキスト入力フィールド */}
            <input
                type="text"
                id="todo-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="TODOを編集..."
                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center mb-4">
                {/* 優先度選択ラジオボタン */}
                <label className="mr-2 text-sm font-medium text-gray-700">優先:</label>
                <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="priority"
                            value="true"
                            checked={isPriority === true}
                            onChange={() => setIsPriority(true)}
                            className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">はい</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="priority"
                            value="false"
                            checked={isPriority === false}
                            onChange={() => setIsPriority(false)}
                            className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">いいえ</span>
                    </label>
                </div>
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
                {/* 更新ボタン */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200 min-w-[80px]"
                >
                    更新
                </button>
                {/* キャンセルボタン */}
                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors duration-200 min-w-[80px]"
                >
                    キャンセル
                </button>
            </div>
        </form>
    );
});

export default TodoEditForm; 