import React, { useRef, useEffect, useState } from 'react';
import type { Todo } from '../types/todo';
import TodoEditForm from './TodoEditForm';

/**
 * @interface TodoItemProps
 * @brief TodoItemコンポーネントのプロパティ定義
 * @param todo - 表示するTODOアイテムオブジェクト
 * @param onToggleCompleted - TODOの完了状態を切り替えるコールバック関数
 * @param onDelete - TODOを削除するコールバック関数
 * @param onStartEdit - TODOの編集を開始するコールバック関数
 * @param activeTodoId - 現在アクティブなTODOのID
 * @param onSetAsActiveTodo - TODOをアクティブに設定するコールバック関数
 * @param time - ポモドーロタイマーの残り時間
 * @param isWorking - 現在が作業時間中かどうかを示すフラグ
 * @param onProgressCircleClick - 進捗円のクリックハンドラ
 * @param editingTodo - 編集中のTODO
 * @param onEditTodo - TODOを編集するコールバック関数
 * @param onCancelEdit - 編集をキャンセルするコールバック関数
 * @param attributes - コンポーネントに適用する追加の属性
 * @param listeners - コンポーネントに適用する追加のリスナー
 * @param initialWorkTimeTotal - 追加
 */
interface TodoItemProps {
    todo: Todo;
    onToggleCompleted: (id: string) => void;
    onDelete: (id: string) => void;
    onStartEdit: (todo: Todo) => void;
    activeTodoId: string | null;
    onSetAsActiveTodo: (id: string) => void;
    time: number;
    isWorking: boolean;
    onProgressCircleClick: (id: string) => void;
    editingTodo?: Todo | null;
    onEditTodo: (id: string, text: string, isPriority: boolean, dueDate?: string) => void;
    onCancelEdit: () => void;
    attributes?: Record<string, any>;
    listeners?: Record<string, any>;
    initialWorkTimeTotal: number;
}

/**
 * @brief 個々のTODOアイテムを表示し、操作（完了、削除、編集、ポモドーロ開始）を可能にするコンポーネント
 * @param props - TodoItemPropsで定義されたプロパティ
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleCompleted, onDelete, onStartEdit, activeTodoId, onSetAsActiveTodo, time, isWorking, onProgressCircleClick, editingTodo, onEditTodo, onCancelEdit, attributes, listeners, initialWorkTimeTotal }) => {
    // 現在表示中のTODOがアクティブなポモドーロの対象であるか
    const isCurrentActiveTodo = activeTodoId === todo.id;
    // 現在のポモドーロの進捗状況を計算（0-100%）
    const progress = initialWorkTimeTotal > 0 ? ((initialWorkTimeTotal - time) / initialWorkTimeTotal) * 100 : 0;

    // 現在のTODOが編集中のTODOであるか
    const isEditingCurrentTodo = editingTodo && editingTodo.id === todo.id;

    const formRef = useRef<HTMLFormElement>(null);
    // ホバー状態を管理するstate
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        if (isEditingCurrentTodo && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isEditingCurrentTodo]);

    /**
     * @brief 期日をフォーマットするヘルパー関数
     * @param dueDateString - フォーマットする期日文字列 (YYYY-MM-DD)
     * @returns フォーマットされた期日文字列
     */
    const formatDueDate = (dueDateString: string) => {
        const today = new Date();
        const dueDate = new Date(dueDateString);

        // 時間情報をリセットして日付のみを比較
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 1週間以内の場合
        if (diffDays >= 0 && diffDays <= 7) {
            if (diffDays === 0) {
                return '今日';
            } else if (diffDays === 1) {
                return '明日';
            } else {
                return `${diffDays}日後`;
            }
        }

        // 同じ年の場合、年を表示しない
        if (today.getFullYear() === new Date(dueDateString).getFullYear()) {
            const month = new Date(dueDateString).getMonth() + 1;
            const day = new Date(dueDateString).getDate();
            return `${month}月${day}日`;
        }

        // それ以外の場合は通常の形式 (YYYY年MM月DD日)
        const year = new Date(dueDateString).getFullYear();
        const month = new Date(dueDateString).getMonth() + 1;
        const day = new Date(dueDateString).getDate();
        return `${year}年${month}月${day}日`;
    };

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
        <div
            className="relative flex flex-col"
            style={{ userSelect: 'none' }}
            {...attributes}
            {...listeners}
        >
            <div
                className={`flex items-center justify-between p-2 my-1 border rounded shadow-sm ${todo.completed ? 'bg-gray-200' : 'bg-white'}`}
                onMouseEnter={() => setShowButtons(true)}
                onMouseLeave={() => setShowButtons(false)}
            >
                <div className="flex items-center">
                    {/* ドラッグ＆ドロップのハンドルは不要になるため削除 */}
                    {/* <span className="cursor-grab text-gray-400 mr-2">::</span> */}
                    {/* TODOの完了チェックボックスまたは完了スターの表示 */}
                    {todo.completed ? (
                        <span
                            className="mr-2 text-xl cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                            aria-label="Toggle todo completed"
                        >
                            ⭐️
                        </span>
                    ) : (
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => { e.stopPropagation(); handleToggle(); }}
                            className="mr-2"
                            aria-label="Toggle todo completed"
                        />
                    )}
                    {/* TODOの内容（クリックでポモドーロ開始）*/}
                    <div onClick={(e) => { e.stopPropagation(); handleToggleActive(); }} className="flex flex-col cursor-pointer flex-grow">
                        {/* TODOテキスト（完了状態によってスタイル変更）*/}
                        <span className={`text-lg ${todo.completed ? 'font-bold text-gray-700' : 'text-gray-900'}`}>
                            {todo.isPriority && <span className="mr-1 text-red-500 font-bold">！</span>}
                            {todo.text}
                        </span>

                        {/* 期限日 */}
                        {todo.dueDate && <span className="block text-sm text-gray-500 mt-1">{formatDueDate(todo.dueDate)}</span>}
                    </div>
                </div>
                <div className="flex items-center">
                    {/* 完了したポモドーロ数に応じた'×'マークの表示 */}
                    {todo.pomodorosCompleted > 0 && (
                        <span className="text-gray-500 text-xs font-bold mr-1">
                            {todo.pomodorosCompleted === 1 ? 'x' : `${todo.pomodorosCompleted}x`}
                        </span>
                    )}

                    {/* 現在アクティブなTODOで、作業時間中であれば進捗円を表示 */}
                    {isCurrentActiveTodo ? (
                        <div
                            className="relative w-6 h-6 rounded-full bg-blue-200 cursor-pointer flex items-center justify-center mr-1"
                            onClick={(e) => { e.stopPropagation(); onProgressCircleClick(todo.id); }}
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
                    <div className="flex items-center transition-opacity duration-300"
                        style={{ opacity: showButtons || isEditingCurrentTodo ? 1 : 0 }}>
                        {/* 編集ボタン */}
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(); }} className="text-sm text-blue-500 hover:underline mr-2" aria-label="Edit todo">Edit</button>
                        {/* 削除ボタン */}
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-sm text-red-500 hover:underline" aria-label="Delete todo">Delete</button>
                    </div>
                </div>
            </div>
            {/* 編集中のTODOであれば、その直下にTodoEditFormを表示 */}
            {isEditingCurrentTodo && (
                <TodoEditForm
                    onEditTodo={onEditTodo}
                    editingTodo={editingTodo}
                    onCancelEdit={onCancelEdit}
                    ref={formRef}
                />
            )}
        </div>
    );
};

export default TodoItem; 