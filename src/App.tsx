import { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import TodoAddForm from './components/TodoAddForm';
import { addTodo, getTodos, toggleTodoCompleted, deleteTodo, updateTodo, reorderTodos, incrementPomodorosCompleted } from './stores/todoStore';
import type { Todo } from './types/todo';
import usePomodoroTimer from './hooks/usePomodoroTimer';
import { savePomodoroSetting, WORK_TIME_KEY, BREAK_TIME_KEY } from './stores/pomodoroSettingsStore';

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

  // アプリケーションヘッダーに表示する日付と曜日を管理するstate
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  // 設定UIの表示状態を管理するstate
  const [showSettings, setShowSettings] = useState(false);
  // 作業時間と休憩時間の入力値を管理するstate
  const [inputWorkTime, setInputWorkTime] = useState(0);
  const [inputBreakTime, setInputBreakTime] = useState(0);

  // カスタムフックからポモドーロタイマーの状態と操作関数を取得
  const { time, isRunning, isWorking, startTimer, pauseTimer, resumeTimer, stopTimer, toggleMode, workTimeSetting, breakTimeSetting, initialPomodoroTime, isTimerActive } = usePomodoroTimer();

  /**
   * @brief コンポーネントのマウント時にTODOをLocal Storageから読み込む副作用
   *        および現在の日付と曜日を設定する副作用
   */
  useEffect(() => {
    setTodos(getTodos());

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('ja-JP', options));
    const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
    setCurrentDay(date.toLocaleDateString('ja-JP', dayOptions));
  }, []); // 空の依存配列により、コンポーネントマウント時に一度だけ実行

  // workTimeSettingとbreakTimeSettingが更新されたときにinputStateを更新
  useEffect(() => {
    setInputWorkTime(workTimeSetting / 60);
    setInputBreakTime(breakTimeSetting / 60);
  }, [workTimeSetting, breakTimeSetting]);

  /**
   * @brief タイマー設定をLocal Storageに保存するハンドラ
   * @param なし
   * @returns なし
   */
  const handleSaveSettings = () => {
    if (inputWorkTime < 1 || inputBreakTime < 1) {
      alert('作業時間と休憩時間は1分以上に設定してください。');
      return;
    }
    savePomodoroSetting(WORK_TIME_KEY, inputWorkTime);
    savePomodoroSetting(BREAK_TIME_KEY, inputBreakTime);
    setShowSettings(false);
  };

  /**
   * @brief 新しいTODOアイテムを追加するハンドラ
   * @param text - TODOのテキスト内容
   * @returns なし
   */
  const handleAddTodo = (text: string) => {
    setTodos(addTodo(text, false, undefined));
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
   * @param isPriority - 新しいTODOの優先度
   * @param dueDate - 新しいTODOの期限日（オプション）
   * @returns なし
   */
  const handleUpdateTodo = (id: string, text: string, isPriority: boolean, dueDate?: string) => {
    setTodos(updateTodo(id, { text, isPriority, dueDate }));
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
    setTodos(reorderTodos(oldIndex, newIndex));
  };

  /**
   * @brief TODOをアクティブなポモドーロの対象に設定し、タイマーを制御するハンドラ
   * @param id - アクティブにするTODOのID
   * @returns なし
   */
  const handleTodoItemClick = (id: string) => {
    // アクティブなTODOが既に存在する場合、何もしない
    if (activeTodoId !== null) {
      return;
    }

    // アクティブなTODOがない場合のみ、クリックされたTODOを作業タイマーの対象として開始
    setActiveTodoId(id); // 新しいTODOをアクティブに設定
    stopTimer(); // タイマーを作業時間にリセットし、作業モードに設定
    startTimer(); // 新しいアクティブTODOの作業タイマーを開始
  };

  /**
   * @brief 完了した作業タイマーの進捗円クリックで休憩タイマーを開始するハンドラ
   * @param id - 進捗円がクリックされたTODOのID
   * @returns なし
   */
  const handleProgressCircleClick = (id: string) => {
    // アクティブなTODOの作業タイマーが完了しており、かつまだ実行中でない場合のみ休憩タイマーを開始
    if (activeTodoId === id && time === 0 && !isRunning && isWorking) {
      setTodos(incrementPomodorosCompleted(id)); // ポモドーロ完了回数を増やす
      setActiveTodoId(null); // 休憩タイマーはTODOと紐づかないため、アクティブTODOを解除
      toggleMode(); // 休憩モードに切り替え
      startTimer(); // 休憩タイマーを開始
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-stretch py-4 relative pb-20">
      {/* 休憩タイマーの残り時間表示 */}
      {isTimerActive ? (
        <div className={`fixed top-0 left-0 w-full text-white text-center py-2 text-lg font-bold z-50 flex justify-center items-center ${isWorking ? 'bg-red-500' : 'bg-blue-500'}`}>
          <span>{isWorking ? '作業中' : '休憩中'}: {`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}</span>
          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 text-gray-800 text-sm"
          >
            {isRunning ? '一時停止' : '再開'}
          </button>
          <button
            onClick={() => {
              stopTimer();
              setActiveTodoId(null); // タイマー停止時にアクティブTODOを解除
            }}
            className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 text-gray-800 text-sm"
          >
            停止
          </button>
        </div>
      ) : null}

      {/* 設定ボタン */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full shadow-lg"
        >
          設定
        </button>
      </div>

      {/* 設定UI */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4 text-center">タイマー設定</h2>
            <div className="mb-4">
              <label htmlFor="work-time" className="block text-gray-700 text-sm font-bold mb-2">
                作業時間 (分):
              </label>
              <input
                type="number"
                id="work-time"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={inputWorkTime}
                onChange={(e) => setInputWorkTime(parseInt(e.target.value, 10))}
                min="1"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="break-time" className="block text-gray-700 text-sm font-bold mb-2">
                休憩時間 (分):
              </label>
              <input
                type="number"
                id="break-time"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={inputBreakTime}
                onChange={(e) => setInputBreakTime(parseInt(e.target.value, 10))}
                min="1"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveSettings}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                設定を保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 w-full flex-grow">
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col flex-grow">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-800">{currentDate}</p>
            <p className="text-sm text-gray-600">{currentDay}</p>
          </div>
          {/* TODOリスト */}
          <TodoList
            todos={todos}
            onToggleCompleted={handleToggleCompleted}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSort={handleSort}
            activeTodoId={activeTodoId}
            onSetAsActiveTodo={handleTodoItemClick}
            onProgressCircleClick={handleProgressCircleClick}
            time={time}
            initialWorkTimeTotal={initialPomodoroTime}
            isWorking={isWorking}
            onEditTodo={handleUpdateTodo}
            onCancelEdit={handleCancelEdit}
            editingTodo={editingTodo}
          />
        </div>
      </div>
      {/* TODO追加フォーム - 常に表示 */}
      {<TodoAddForm onAddTodo={handleAddTodo} />}
    </div>
  );
}

export default App;
