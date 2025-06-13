/**
 * @interface Todo
 * @brief TODOアイテムのデータ構造を定義するインターフェース
 * @param id - TODOを一意に識別するID
 * @param text - TODOのテキスト内容
 * @param priority - TODOの優先度（'low', 'medium', 'high'）
 * @param dueDate - TODOの期日（オプション）
 * @param completed - TODOが完了しているかどうかのフラグ
 * @param pomodorosCompleted - このTODOで完了したポモドーロの回数
 */
export interface Todo {
    id: string;
    text: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string; // Optional due date
    completed: boolean;
    pomodorosCompleted: number;
} 