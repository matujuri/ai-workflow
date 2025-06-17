import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
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
 * @param onProgressCircleClick - TODOの進捗円をクリックしたときに呼び出されるコールバック関数
 * @param onEditTodo - TODOの編集を行うコールバック関数
 * @param onCancelEdit - TODOの編集をキャンセルするコールバック関数
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param initialWorkTimeTotal - ポモドーロ開始時点の総作業時間
 */
interface SortableTodoItemProps {
    todo: Todo;
    onToggleCompleted: (id: string) => void;
    onDelete: (id: string) => void;
    onStartEdit: (todo: Todo) => void;
    activeTodoId: string | null;
    onSetAsActiveTodo: (id: string) => void;
    time: number;
    onProgressCircleClick: (id: string) => void;
    onEditTodo: (id: string, text: string, isPriority: boolean, dueDate?: string) => void;
    onCancelEdit: () => void;
    editingTodo?: Todo | null;
    initialWorkTimeTotal: number;
}

/**
 * @brief ドラッグ＆ドロップ機能を持つ個々のTODOアイテムコンポーネント
 * useSortableフックを使用してDND機能を提供し、内部でTodoItemを表示します。
 * @param props - SortableTodoItemPropsで定義されたプロパティ
 */
const SortableTodoItem: React.FC<SortableTodoItemProps> = ({ todo, onToggleCompleted, onDelete, onStartEdit, activeTodoId, onSetAsActiveTodo, time, onProgressCircleClick, onEditTodo, onCancelEdit, editingTodo, initialWorkTimeTotal }) => {
    // DND-kitのuseSortableフックから必要な属性とリスナーを取得
    const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: todo.id });

    // ドラッグ中のスタイルを適用
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div style={{ ...style, touchAction: 'none' }} ref={setNodeRef}>
            {/* 基本的なTODOアイテムを表示 */}
            <TodoItem
                todo={todo}
                onToggleCompleted={onToggleCompleted}
                onDelete={onDelete}
                onStartEdit={onStartEdit}
                activeTodoId={activeTodoId}
                onSetAsActiveTodo={onSetAsActiveTodo}
                time={time}
                onProgressCircleClick={onProgressCircleClick}
                onEditTodo={onEditTodo}
                onCancelEdit={onCancelEdit}
                editingTodo={editingTodo}
                attributes={attributes || {}}
                listeners={listeners || {}}
                initialWorkTimeTotal={initialWorkTimeTotal}
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
 * @param onProgressCircleClick - TODOの進捗円をクリックしたときに呼び出されるコールバック関数
 * @param className - 追加のクラス名
 * @param onEditTodo - TODOの編集を行うコールバック関数
 * @param onCancelEdit - TODOの編集をキャンセルするコールバック関数
 * @param editingTodo - 編集中のTODOアイテムオブジェクト（オプション）
 * @param initialWorkTimeTotal - ポモドーロ開始時点の総作業時間
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
    onProgressCircleClick: (id: string) => void;
    className?: string;
    onEditTodo: (id: string, text: string, isPriority: boolean, dueDate?: string) => void;
    onCancelEdit: () => void;
    editingTodo?: Todo | null;
    initialWorkTimeTotal: number;
}

/**
 * @brief TODOアイテムのリストを表示し、ドラッグ＆ドロップによる並び替え機能を可能にするコンポーネント
 * DndContextとSortableContextを提供し、SortableTodoItemをレンダリングします。
 * @param props - TodoListPropsで定義されたプロパティ
 */
const TodoList: React.FC<TodoListProps> = ({ todos, onToggleCompleted, onDelete, onStartEdit, onSort, activeTodoId, onSetAsActiveTodo, time, onProgressCircleClick, className, onEditTodo, onCancelEdit, editingTodo, initialWorkTimeTotal }) => {
    // Dnd-kitのセンサーを設定（ポインターとキーボード操作に対応）
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // 10pxの移動でドラッグ開始
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 500, // 500msの長押しでドラッグ開始
                tolerance: 5, // 5pxの移動許容範囲
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    /**
     * @brief ドラッグ終了時に呼び出されるハンドラ
     * @param event - ドラッグイベントオブジェクト
     * @returns なし
     */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // ドラッグ開始と終了のIDが異なる場合、並び替え処理を実行
        if (over && active.id !== over.id) {
            const oldIndex = todos.findIndex((item) => item.id === active.id);
            const newIndex = todos.findIndex((item) => item.id === over.id);
            onSort(oldIndex, newIndex);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* ソート可能なコンテキストを提供し、TODOアイテムをレンダリング */}
            <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
                <div
                    className={`space-y-2 flex flex-col flex-grow relative ${className}`}
                >
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
                            onProgressCircleClick={onProgressCircleClick}
                            onEditTodo={onEditTodo}
                            onCancelEdit={onCancelEdit}
                            editingTodo={editingTodo}
                            initialWorkTimeTotal={initialWorkTimeTotal}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default TodoList; 