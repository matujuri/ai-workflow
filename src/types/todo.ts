/**
 * @interface Todo
 * @brief TODOアイテムのデータ構造を定義するインターフェース
 * @param id - TODOを一意に識別するID
 * @param text - TODOのテキスト内容
 * @param isPriority - TODOが優先されるかどうかのフラグ
 * @param dueDate - TODOの期日（オプション）
 * @param completed - TODOが完了しているかどうかのフラグ
 * @param pomodorosCompleted - このTODOで完了したポモドーロの回数
 * @param timeSpent - このTODOに費やした時間（分単位）
 */
export interface Todo {
    id: string;
    text: string;
    isPriority: boolean;
    dueDate?: string; // Optional due date
    completed: boolean;
    pomodorosCompleted: number;
} 