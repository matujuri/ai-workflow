import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import PomodoroTimer from './components/PomodoroTimer';
import { addTodo, getTodos, toggleTodoCompleted, deleteTodo, updateTodo, reorderTodos, incrementPomodorosCompleted } from './stores/todoStore';
import type { Todo } from './types/todo';
import usePomodoroTimer from './hooks/usePomodoroTimer';

/**
 * @brief メインアプリケーションコンポーネント
 * TODOリストとポモドーロタイマー機能を統合して表示します。
 */
function App() {
  // TODOアイテムのリストを管理するstate
  const [todos, setTodos] = useState<Todo[]>([]);
  // 現在編集中のTODOアイテムを管理するstate
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  // 現在アクティブな（ポモドーロタイマーの対象となっている）TODOのIDを管理するstate
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);

  // カスタムフックからポモドーロタイマーの状態と操作関数を取得
  const { time, isRunning, isWorking, startTimer, pauseTimer, resetTimer, toggleMode, WORK_TIME, BREAK_TIME } = usePomodoroTimer();

  /**
   * @brief コンポーネントのマウント時にTODOをLocal Storageから読み込む副作用
   */
  useEffect(() => {
    setTodos(getTodos());
    console.log('App: Initial todos loaded', getTodos());
  }, []); // 空の依存配列により、コンポーネントマウント時に一度だけ実行

  /**
   * @brief 新しいTODOアイテムを追加するハンドラ
   * @param text - TODOのテキスト内容
   * @param priority - TODOの優先度
   * @param dueDate - TODOの期限日（オプション）
   * @returns なし
   */
  const handleAddTodo = (text: string, priority: Todo['priority'], dueDate?: string) => {
    console.log('App: handleAddTodo called with', { text, priority, dueDate });
    setTodos(addTodo(text, priority, dueDate));
  };

  /**
   * @brief TODOの完了状態をトグルするハンドラ
   * @param id - 完了状態を切り替えるTODOのID
   * @returns なし
   */
  const handleToggleCompleted = (id: string) => {
    console.log('App: handleToggleCompleted called with ID', id);
    setTodos(toggleTodoCompleted(id));
  };

  /**
   * @brief TODOを削除するハンドラ
   * @param id - 削除するTODOのID
   * @returns なし
   */
  const handleDelete = (id: string) => {
    console.log('App: handleDelete called with ID', id);
    setTodos(deleteTodo(id));
  };

  /**
   * @brief TODOを更新するハンドラ
   * @param id - 更新するTODOのID
   * @param text - 新しいTODOのテキスト内容
   * @param priority - 新しいTODOの優先度
   * @param dueDate - 新しいTODOの期限日（オプション）
   * @returns なし
   */
  const handleUpdateTodo = (id: string, text: string, priority: Todo['priority'], dueDate?: string) => {
    console.log('App: handleUpdateTodo called with', { id, text, priority, dueDate });
    setTodos(updateTodo(id, { text, priority, dueDate }));
    setEditingTodo(null);
  };

  /**
   * @brief TODOの編集を開始するハンドラ
   * @param todo - 編集対象のTODOアイテム
   * @returns なし
   */
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  /**
   * @brief TODOの編集をキャンセルするハンドラ
   * @param なし
   * @returns なし
   */
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  /**
   * @brief TODOリストの並び替えを処理するハンドラ
   * @param oldIndex - ドラッグ開始時のTODOのインデックス
   * @param newIndex - ドラッグ終了時のTODOのインデックス
   * @returns なし
   */
  const handleSort = (oldIndex: number, newIndex: number) => {
    console.log('App: handleSort called with', { oldIndex, newIndex });
    setTodos(reorderTodos(oldIndex, newIndex));
  };

  /**
   * @brief ポモドーロタイマーをリセットし、アクティブなTODOの指定を解除するハンドラ
   * @param なし
   * @returns なし
   */
  const handleResetPomodoro = () => {
    resetTimer();
    setActiveTodoId(null);
  };

  /**
   * @brief TODOをアクティブなポモドーロの対象に設定し、タイマーを制御するハンドラ
   * @param id - アクティブにするTODOのID
   * @returns なし
   */
  const handleSetAsActiveTodo = (id: string) => {
    const clickedTodo = todos.find(todo => todo.id === id);
    // 完了済みのTODOがクリックされた場合はタイマーを起動しない
    if (clickedTodo && clickedTodo.completed) {
      console.log("Completed todo clicked, not starting timer.");
      return;
    }

    // クリックされたTODOが現在アクティブなTODOの場合
    if (activeTodoId === id) {
      // タイマーが0の場合（作業時間または休憩時間が終了した場合）
      if (time === 0) {
        // 現在が作業時間の場合（作業時間が終了したばかり）
        if (isWorking) {
          // ポモドーロ完了回数を増やし、休憩モードに切り替えて休憩タイマーを開始
          setTodos(incrementPomodorosCompleted(id)); // pomodorosCompletedをインクリメントし、localStorageに保存
          toggleMode(); // 休憩モードに切り替え
          startTimer(); // 休憩タイマーを開始
        } else {
          // 現在が休憩時間の場合（休憩時間が終了したばかり）
          // 作業モードに切り替える（タイマーは自動開始しない、ユーザーのクリックで再開）
          toggleMode();
        }
      } else {
        // タイマーが実行中または一時停止中の場合、クリックで一時停止/再開を切り替える
        if (isRunning) {
          pauseTimer(); // 一時停止
        } else {
          startTimer(); // 再開
        }
      }
    } else {
      // クリックされたTODOが現在アクティブでない場合（別のTODOがクリックされたか、アクティブなTODOがない場合）
      // 以前アクティブなTODOがあり、タイマーが実行中であれば一時停止
      if (activeTodoId !== null && isRunning) {
        pauseTimer();
      }
      setActiveTodoId(id); // 新しいTODOをアクティブに設定
      resetTimer(); // タイマーを作業時間にリセットし、作業モードに設定
      startTimer(); // 新しいアクティブTODOの作業タイマーを開始
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 w-full max-w-4xl">
        {/* TODOリストセクション */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">My Todos</h1>
          {/* TODOフォーム */}
          <TodoForm
            onAddTodo={handleAddTodo}
            onEditTodo={handleUpdateTodo}
            editingTodo={editingTodo}
            onCancelEdit={handleCancelEdit}
          />
          {/* TODOリスト */}
          <TodoList
            todos={todos}
            onToggleCompleted={handleToggleCompleted}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSort={handleSort}
            activeTodoId={activeTodoId}
            onSetAsActiveTodo={handleSetAsActiveTodo}
            time={time}
            WORK_TIME={WORK_TIME}
            isWorking={isWorking}
          />
        </div>
        {/* ポモドーロタイマーセクション */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <PomodoroTimer
            time={time}
            isRunning={isRunning}
            isWorking={isWorking}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            resetTimer={resetTimer}
            toggleMode={toggleMode}
            onResetClick={handleResetPomodoro}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
