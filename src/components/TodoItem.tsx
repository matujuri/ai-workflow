import React from 'react';
import type { Todo } from '../types/todo';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

/**
 * @interface TodoItemProps
 * @brief TodoItemコンポーネントのプロパティ定義
 * @param todo - 表示するTODOアイテムオブジェクト
 * @param onToggleCompleted - TODOの完了状態を切り替えるコールバック関数
 * @param onDelete - TODOを削除するコールバック関数
 * @param onStartEdit - TODOの編集を開始するコールバック関数
 * @param attributes - ドラッグ＆ドロップのための属性
 * @param listeners - ドラッグ＆ドロップのためのイベントリスナー
 * @param activeTodoId - 現在アクティブなTODOのID
 * @param onSetAsActiveTodo - TODOをアクティブに設定するコールバック関数
 * @param time - ポモドーロタイマーの残り時間
 * @param WORK_TIME - ポモドーロ作業時間の総時間
 * @param isWorking - 現在が作業時間中かどうかを示すフラグ
 */
interface TodoItemProps {
    todo: Todo;
    onToggleCompleted: (id: string) => void;
    onDelete: (id: string) => void;
    onStartEdit: (todo: Todo) => void;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    activeTodoId: string | null;
    onSetAsActiveTodo: (id: string) => void;
    time: number;
    WORK_TIME: number;
    isWorking: boolean;
}

/**
 * @brief 個々のTODOアイテムを表示し、操作（完了、削除、編集、ポモドーロ開始）を可能にするコンポーネント
 * @param props - TodoItemPropsで定義されたプロパティ
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleCompleted, onDelete, onStartEdit, attributes, listeners, activeTodoId, onSetAsActiveTodo, time, WORK_TIME, isWorking }) => {
    // 現在表示中のTODOがアクティブなポモドーロの対象であるか
    const isCurrentActiveTodo = activeTodoId === todo.id;
    // 現在のポモドーロの進捗状況を計算（0-100%）
    const progress = isCurrentActiveTodo ? ((WORK_TIME - time) / WORK_TIME) * 100 : 0;

    /**
     * @brief TODOの完了状態をトグルするハンドラ
     * @param なし
     * @returns なし
     */
    const handleToggle = () => {
        onToggleCompleted(todo.id);
    };

    /**
     * @brief TODOを削除するハンドラ
     * @param なし
     * @returns なし
     */
    const handleDelete = () => {
        console.log('Delete button clicked for todo:', todo.id);
        if (window.confirm('このTODOを削除してもよろしいですか？')) {
            onDelete(todo.id);
        }
    };

    /**
     * @brief TODOの編集を開始するハンドラ
     * @param なし
     * @returns なし
     */
    const handleEditClick = () => {
        console.log('Edit button clicked for todo:', todo.id);
        onStartEdit(todo);
    };

    /**
     * @brief TODOをアクティブなポモドーロの対象に設定するハンドラ
     * @param なし
     * @returns なし
     */
    const handleToggleActive = () => {
        onSetAsActiveTodo(todo.id);
    };

    return (
        <div className={`flex items-center justify-between p-2 my-1 border rounded shadow-sm ${todo.completed ? 'bg-gray-200' : 'bg-white'}`}>
            <div className="flex items-center">
                {/* ドラッグ＆ドロップのハンドル */}
                <span className="cursor-grab text-gray-400 mr-2" {...listeners} {...attributes}>::</span>
                {/* TODOの完了チェックボックスまたは完了スターの表示 */}
                {todo.completed ? (
                    <span
                        className="mr-2 text-xl cursor-pointer"
                        onClick={handleToggle}
                        aria-label="Toggle todo completed"
                    >
                        ⭐️
                    </span>
                ) : (
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={handleToggle}
                        className="mr-2"
                        aria-label="Toggle todo completed"
                    />
                )}
                {/* TODOの内容（クリックでポモドーロ開始/再開/一時停止）*/}
                <div onClick={handleToggleActive} className="flex items-center cursor-pointer flex-grow">
                    {/* TODOテキスト（完了状態によってスタイル変更）*/}
                    <span className={`text-lg ${todo.completed ? 'font-bold text-gray-700' : 'text-gray-900'}`}>
                        {todo.text}
                    </span>

                    {/* 期限日と優先度 */}
                    {todo.dueDate && <span className="ml-2 text-sm text-gray-500">({todo.dueDate})</span>}
                    <span className={`ml-2 text-sm ${todo.priority === 'high' ? 'text-red-600' : todo.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'}`}>
                        [{todo.priority}]
                    </span>
                </div>
            </div>
            <div className="flex items-center">
                {/* 完了したポモドーロ数に応じた'×'マークの表示 */}
                {Array.from({ length: todo.pomodorosCompleted }).map((_, index) => (
                    <span key={index} className="text-gray-500 text-xs font-bold mr-1">×</span>
                ))}

                {/* 現在アクティブなTODOで、作業時間中であれば進捗円を表示 */}
                {isCurrentActiveTodo && isWorking ? (
                    <div
                        className="relative w-6 h-6 rounded-full bg-blue-200 cursor-pointer flex items-center justify-center mr-1"
                        onClick={handleToggleActive}
                    >
                        {/* 進捗を示す青い円 */}
                        <div
                            className="absolute inset-0 rounded-full bg-blue-500"
                            style={{ clipPath: `inset(0% 0% 0% ${100 - progress}%)` }}
                        ></div>
                        {/* The 'x' is now rendered by the pomodorosCompleted array when a pomodoro is finished and user clicks on the circle. */}
                    </div>
                ) : (
                    null
                )}
                {/* 編集ボタン */}
                <button onClick={handleEditClick} className="text-sm text-blue-500 hover:underline mr-2" aria-label="Edit todo">Edit</button>
                {/* 削除ボタン */}
                <button onClick={handleDelete} className="text-sm text-red-500 hover:underline" aria-label="Delete todo">Delete</button>
            </div>
        </div>
    );
};

export default TodoItem; 