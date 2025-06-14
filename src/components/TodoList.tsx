import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../types/todo';
import TodoItem from './TodoItem';

/**
 * @interface SortableTodoItemProps
 * @brief ドラッグ＆ドロップ可能なTodoItemのプロパティ定義
 * @param todo - 表示するTODOアイテムオブジェクト
 * @param onToggleCompleted - TODOの完了状態を切り替えるコールバック関数
 * @param onDelete - TODOを削除するコールバック関数
 * @param onStartEdit - TODOの編集を開始するコールバック関数
 * @param activeTodoId - 現在アクティブなTODOのID
 * @param onSetAsActiveTodo - TODOをアクティブに設定するコールバック関数
 * @param time - ポモドーロタイマーの残り時間
 * @param WORK_TIME - ポモドーロ作業時間の総時間
 * @param isWorking - 現在が作業時間中かどうかを示すフラグ
 * @param isWorkTimeCompleted - 作業時間が完了したかどうかを示すフラグ
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param onEditTodo - TODOを編集するコールバック関数
 * @param onCancelEdit - 編集キャンセル時のコールバック関数
 */
interface SortableTodoItemProps {
    todo: Todo;
    onToggleCompleted: (id: string) => void;
    onDelete: (id: string) => void;
    onStartEdit: (todo: Todo) => void;
    activeTodoId: string | null;
    onSetAsActiveTodo: (id: string) => void;
    time: number;
    WORK_TIME: number;
    isWorking: boolean;
    isWorkTimeCompleted: boolean;
    editingTodo: Todo | null;
    onEditTodo: (id: string, text: string, priority: boolean, dueDate?: string) => void;
    onCancelEdit: () => void;
}

/**
 * @brief ドラッグ＆ドロップ機能を持つ個々のTODOアイテムコンポーネント
 * useSortableフックを使用してDND機能を提供し、内部でTodoItemを表示します。
 * @param props - SortableTodoItemPropsで定義されたプロパティ
 */
const SortableTodoItem: React.FC<SortableTodoItemProps> = ({ todo, onToggleCompleted, onDelete, onStartEdit, activeTodoId, onSetAsActiveTodo, time, WORK_TIME, isWorking, isWorkTimeCompleted, editingTodo, onEditTodo, onCancelEdit }) => {
    // DND-kitのuseSortableフックから必要な属性とリスナーを取得
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });

    // ドラッグ中のスタイルを適用
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {/* 基本的なTODOアイテムを表示 */}
            <TodoItem
                todo={todo}
                onToggleCompleted={onToggleCompleted}
                onDelete={onDelete}
                onStartEdit={onStartEdit}
                attributes={attributes}
                listeners={listeners}
                activeTodoId={activeTodoId}
                onSetAsActiveTodo={onSetAsActiveTodo}
                time={time}
                WORK_TIME={WORK_TIME}
                isWorking={isWorking}
                isWorkTimeCompleted={isWorkTimeCompleted}
                editingTodo={editingTodo}
                onEditTodo={onEditTodo}
                onCancelEdit={onCancelEdit}
            />
        </div>
    );
};

/**
 * @interface TodoListProps
 * @brief TodoListコンポーネントのプロパティ定義
 * @param todos - 表示するTODOアイテムの配列
 * @param onToggleCompleted - TODOの完了状態を切り替えるコールバック関数
 * @param onDelete - TODOを削除するコールバック関数
 * @param onStartEdit - TODOの編集を開始するコールバック関数
 * @param onSort - TODOの並び替えを処理するコールバック関数
 * @param activeTodoId - 現在アクティブなTODOのID
 * @param onSetAsActiveTodo - TODOをアクティブに設定するコールバック関数
 * @param time - ポモドーロタイマーの残り時間
 * @param WORK_TIME - ポモドーロ作業時間の総時間
 * @param isWorking - 現在が作業時間中かどうかを示すフラグ
 * @param isWorkTimeCompleted - 作業時間が完了したかどうかを示すフラグ
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param onEditTodo - TODOを編集するコールバック関数
 * @param onCancelEdit - 編集キャンセル時のコールバック関数
 */
interface TodoListProps {
    todos: Todo[];
    onToggleCompleted: (id: string) => void;
    onDelete: (id: string) => void;
    onStartEdit: (todo: Todo) => void;
    onSort: (oldIndex: number, newIndex: number) => void;
    activeTodoId: string | null;
    onSetAsActiveTodo: (id: string) => void;
    time: number;
    WORK_TIME: number;
    isWorking: boolean;
    isWorkTimeCompleted: boolean;
    editingTodo: Todo | null;
    onEditTodo: (id: string, text: string, priority: boolean, dueDate?: string) => void;
    onCancelEdit: () => void;
}

/**
 * @brief TODOアイテムのリストを表示し、ドラッグ＆ドロップによる並び替え機能を可能にするコンポーネント
 * DndContextとSortableContextを提供し、SortableTodoItemをレンダリングします。
 * @param props - TodoListPropsで定義されたプロパティ
 */
const TodoList: React.FC<TodoListProps> = ({ todos, onToggleCompleted, onDelete, onStartEdit, onSort, activeTodoId, onSetAsActiveTodo, time, WORK_TIME, isWorking, isWorkTimeCompleted, editingTodo, onEditTodo, onCancelEdit }) => {
    // Dnd-kitのセンサーを設定（ポインターとキーボード操作に対応）
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    /**
     * @brief ドラッグ終了時に呼び出されるハンドラ
     * @param event - ドラッグイベントオブジェクト
     * @returns なし
     */
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        // ドラッグ開始と終了のIDが異なる場合、並び替え処理を実行
        if (active.id !== over.id) {
            const oldIndex = todos.findIndex((item) => item.id === active.id);
            const newIndex = todos.findIndex((item) => item.id === over.id);
            onSort(oldIndex, newIndex);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* ソート可能なコンテキストを提供し、TODOアイテムをレンダリング */}
            <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {todos.map((todo) => (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            onToggleCompleted={onToggleCompleted}
                            onDelete={onDelete}
                            onStartEdit={onStartEdit}
                            activeTodoId={activeTodoId}
                            onSetAsActiveTodo={onSetAsActiveTodo}
                            time={time}
                            WORK_TIME={WORK_TIME}
                            isWorking={isWorking}
                            isWorkTimeCompleted={isWorkTimeCompleted}
                            editingTodo={editingTodo}
                            onEditTodo={onEditTodo}
                            onCancelEdit={onCancelEdit}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default TodoList; 