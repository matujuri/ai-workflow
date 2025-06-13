import React from 'react';
// import usePomodoroTimer from '../hooks/usePomodoroTimer'; // usePomodoroTimerを削除
import { formatTime } from '../utils/timer';

/**
 * @interface PomodoroTimerProps
 * @brief PomodoroTimerコンポーネントのプロパティ定義
 * @param time - タイマーの残り時間（秒）
 * @param isRunning - タイマーが実行中か
 * @param isWorking - 現在が作業時間か
 * @param startTimer - タイマーを開始する関数
 * @param pauseTimer - タイマーを一時停止する関数
 * @param resetTimer - タイマーをリセットする関数
 * @param toggleMode - 作業時間と休憩時間を切り替える関数
 * @param onResetClick - リセットボタンがクリックされた時のコールバック関数
 */
interface PomodoroTimerProps {
    time: number;
    isRunning: boolean;
    isWorking: boolean;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    toggleMode: () => void;
    onResetClick: () => void;
}

/**
 * @brief ポモドーロタイマーのUIを表示するコンポーネント
 * @param props - PomodoroTimerPropsで定義されたプロパティ
 */
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ time, isRunning, isWorking, startTimer, pauseTimer, resetTimer, toggleMode, onResetClick }) => {
    // const { time, isRunning, isWorking, startTimer, pauseTimer, resetTimer, toggleMode } = usePomodoroTimer(); // 削除

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
            {/* タイマーの残り時間表示 */}
            <div className={`text-6xl font-bold mb-4 ${isWorking ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(time)}
            </div>
            {/* タイマー操作ボタン群 */}
            <div className="flex space-x-4 mb-4">
                {/* 開始ボタン */}
                <button
                    onClick={startTimer}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={isRunning}
                >
                    Start
                </button>
                {/* 一時停止ボタン */}
                <button
                    onClick={pauseTimer}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    disabled={!isRunning}
                >
                    Pause
                </button>
                {/* リセットボタン */}
                <button
                    onClick={onResetClick}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                    Reset
                </button>
            </div>
            {/* モード切り替えボタン */}
            <button
                onClick={toggleMode}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
                {isWorking ? 'Switch to Break' : 'Switch to Work'}
            </button>
            {/* 現在のモード表示 */}
            <div className="mt-4 text-lg">
                {isWorking ? 'Working Time' : 'Break Time'}
            </div>
        </div>
    );
};

export default PomodoroTimer; 