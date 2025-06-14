import { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import { addTodo, getTodos, toggleTodoCompleted, deleteTodo, updateTodo, reorderTodos, incrementPomodorosCompleted } from './stores/todoStore';
import type { Todo } from './types/todo';
import usePomodoroTimer from './hooks/usePomodoroTimer';
import { formatDateWithDay } from './utils/dateUtils';

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
  // フォームの表示状態を管理するstate
  const [showTodoForm, setShowTodoForm] = useState(false);

  // カスタムフックからポモドーロタイマーの状態と操作関数を取得
  const { time, isRunning, isWorking, startTimer, pauseTimer, resetTimer, WORK_TIME, isBreakTimerActive, breakTimeRemaining, isWorkTimeCompleted, startBreak } = usePomodoroTimer();

  /**
   * @brief コンポーネントのマウント時にTODOをLocal Storageから読み込む副作用
   */
  useEffect(() => {
    setTodos(getTodos());
  }, []); // 空の依存配列により、コンポーネントマウント時に一度だけ実行

  /**
   * @brief TODO追加フォームの表示/非表示を切り替えるハンドラ
   * @returns なし
   */
  const toggleTodoFormVisibility = () => {
    setShowTodoForm(prev => !prev);
    // フォームを非表示にする際に編集中のTODOをリセット
    if (editingTodo && showTodoForm) {
      setEditingTodo(null);
    }
  };

  /**
   * @brief 新しいTODOアイテムを追加するハンドラ
   * @param text - TODOのテキスト内容
   * @param priority - TODOの優先度
   * @param dueDate - TODOの期限日（オプション）
   * @returns なし
   */
  const handleAddTodo = (text: string, priority: boolean, dueDate?: string) => {
    setTodos(addTodo(text, priority, dueDate));
    setShowTodoForm(false); // TODO追加後にフォームを非表示にする
  };

  /**
   * @brief TODOの完了状態をトグルするハンドラ
   * @param id - 完了状態を切り替えるTODOのID
   * @returns なし
   */
  const handleToggleCompleted = (id: string) => {
    setTodos(toggleTodoCompleted(id));
  };

  /**
   * @brief TODOを削除するハンドラ
   * @param id - 削除するTODOのID
   * @returns なし
   */
  const handleDelete = (id: string) => {
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
  const handleUpdateTodo = (id: string, text: string, priority: boolean, dueDate?: string) => {
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
    setShowTodoForm(true); // Editボタンクリック時にフォームを表示
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
      return;
    }

    // クリックされたTODOが現在アクティブなTODOの場合
    if (activeTodoId === id) {
      // If work time is completed for the active todo, clicking should increment x and start break
      if (isWorkTimeCompleted) {
        setTodos(incrementPomodorosCompleted(id)); // pomodorosCompletedをインクリメントし、localStorageに保存
        setActiveTodoId(null);
        startBreak(); // 休憩タイマーを開始
        return; // Exit after handling this specific case
      }

      // タイマーが0の場合（作業時間または休憩時間が終了した場合）
      if (time === 0) {
        // 現在が作業時間の場合（作業時間が終了したばかり） - このブロックはisWorkTimeCompletedで既に処理されるため、実質的に到達しない
        if (!isWorking && time === 0) {
          // 休憩時間が終了した場合（または休憩タイマーが手動で停止/スキップされた場合）
          // もう一度クリックすると、このTODOの作業タイマーが再開するはず。
          // resetTimer()はisWorkingをtrueに設定し、timeをWORK_TIMEに設定し、isBreakTimerActiveをfalseに設定し、isWorkTimeCompletedをfalseに設定する。
          // なので、タイマーを開始するだけ。
          resetTimer();
          startTimer();
        } else {
          // タイマーが0になったが、作業完了によるものではない場合（例：手動でリセットされた場合）
          resetTimer();
          startTimer();
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
      // 休憩タイマーがアクティブな場合、停止してリセットする。
      if (isBreakTimerActive) {
        resetTimer(); // これによりisWorkTimeCompletedもfalseになり、isWorkingがtrueになり、timeがWORK_TIMEになる
      }
      // 以前のTODOの作業時間が完了している場合、その状態をリセットする。
      if (isWorkTimeCompleted) {
        resetTimer(); // ユーザーが作業時間完了後に別のTODOをクリックした場合をカバーする
      }

      setActiveTodoId(id); // 新しいTODOをアクティブに設定
      resetTimer(); // 新しいアクティブTODOの作業時間にリセット
      startTimer(); // 新しいアクティブTODOの作業タイマーを開始
    }
  };

  // 秒をMM:SS形式にフォーマットするヘルパー関数
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 w-full max-w-4xl h-full">
        {/* TODOリストセクション */}
        <div
          className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col h-full overflow-y-auto"
          onClick={(e) => {
            // クリックイベントがこのdiv自体で発生した場合のみフォームをトグル
            if (e.target === e.currentTarget) {
              toggleTodoFormVisibility();
            }
          }}
        >
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">{formatDateWithDay()}</h1>
          {/* 休憩タイマーの残り時間表示 */}
          {isBreakTimerActive && (
            <p className="text-lg font-medium text-center text-blue-600 mb-2">
              休憩残り時間: {formatTime(breakTimeRemaining)}
            </p>
          )}
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
            isWorkTimeCompleted={isWorkTimeCompleted}
            editingTodo={editingTodo}
            onEditTodo={handleUpdateTodo}
            onCancelEdit={handleCancelEdit}
          />
          {/* TODOフォーム (新規追加用) */}
          {showTodoForm && !editingTodo && (
            <TodoForm
              onAddTodo={handleAddTodo}
              onEditTodo={handleUpdateTodo}
              editingTodo={null}
              onCancelEdit={handleCancelEdit}
            />
          )}
          {/* ポモドーロタイマーのリセットボタンを追加 */}
          <button
            onClick={handleResetPomodoro}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            タイマーリセット
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
