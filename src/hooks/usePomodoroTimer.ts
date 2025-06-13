import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @interface UsePomodoroTimerReturn
 * @brief usePomodoroTimerフックの戻り値の型定義
 * @param time - ポモドーロタイマーの残り時間（秒単位）
 * @param isRunning - タイマーが現在実行中であるかを示すフラグ
 * @param isWorking - 現在が作業時間であるか（true）休憩時間であるか（false）を示すフラグ
 * @param startTimer - タイマーを開始する関数
 * @param pauseTimer - タイマーを一時停止する関数
 * @param resetTimer - タイマーをリセットする関数
 * @param toggleMode - 作業時間と休憩時間を切り替える関数
 * @param WORK_TIME - 定義された作業時間（秒）
 * @param BREAK_TIME - 定義された休憩時間（秒）
 */
interface UsePomodoroTimerReturn {
    time: number; // 秒単位の残り時間
    isRunning: boolean; // タイマーが実行中か
    isWorking: boolean; // 現在が作業時間か
    startTimer: () => void; // タイマーを開始する関数
    pauseTimer: () => void; // タイマーを一時停止する関数
    resetTimer: () => void; // タイマーをリセットする関数
    toggleMode: () => void; // 作業時間と休憩時間を切り替える関数
    WORK_TIME: number; // 作業時間（秒）
    BREAK_TIME: number; // 休憩時間（秒）
}

// ポモドーロ作業時間（25分を秒に変換）
const WORK_TIME = 25 * 60;
// ポモドーロ休憩時間（5分を秒に変換）
const BREAK_TIME = 5 * 60;

/**
 * @brief ポモドーロタイマーのロジックを提供するカスタムReactフック
 * @returns UsePomodoroTimerReturn - タイマーの状態と操作関数
 */
const usePomodoroTimer = (): UsePomodoroTimerReturn => {
    // タイマーの残り時間状態
    const [time, setTime] = useState(WORK_TIME);
    // タイマーが実行中かどうかの状態
    const [isRunning, setIsRunning] = useState(false);
    // 現在が作業時間か休憩時間かの状態（true: 作業時間, false: 休憩時間）
    const [isWorking, setIsWorking] = useState(true);
    // setIntervalのIDを保持するためのref
    const intervalRef = useRef<number | null>(null);

    // isWorkingの状態が変更されたときに、タイマーの残り時間を初期化する
    useEffect(() => {
        setTime(isWorking ? WORK_TIME : BREAK_TIME);
    }, [isWorking]);

    /**
     * @brief タイマーを開始する関数
     * タイマーが停止している場合のみ実行中状態にする。
     * @param なし
     * @returns なし
     */
    const startTimer = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
        }
    }, [isRunning]);

    /**
     * @brief タイマーを一時停止する関数
     * タイマーが実行中の場合のみ停止状態にする。
     * @param なし
     * @returns なし
     */
    const pauseTimer = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
        }
    }, [isRunning]);

    /**
     * @brief タイマーをリセットする関数
     * タイマーを停止し、作業モードに戻し、残り時間を初期作業時間に戻す。
     * @param なし
     * @returns なし
     */
    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setIsWorking(true);
        setTime(WORK_TIME);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /**
     * @brief 作業時間と休憩時間を切り替える関数
     * 現在のタイマーを一時停止し、モードを切り替えて新しいモードの時間を設定する。
     * @param なし
     * @returns なし
     */
    const toggleMode = useCallback(() => {
        setIsRunning(false); // モード切り替え時はタイマーを一時停止
        setIsWorking(prevIsWorking => {
            const newIsWorking = !prevIsWorking;
            setTime(newIsWorking ? WORK_TIME : BREAK_TIME);
            return newIsWorking;
        });
    }, [WORK_TIME, BREAK_TIME]);

    // タイマーのカウントダウンロジックと通知処理
    useEffect(() => {
        if (isRunning && time > 0) {
            // タイマーが実行中で時間が残っている場合、1秒ごとに時間を減らす
            intervalRef.current = window.setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (time === 0) {
            // タイマーが0になったときの処理
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsRunning(false); // タイマーが0になったら停止

            // 通知
            const notificationText = isWorking ? '作業時間終了！休憩しましょう！' : '休憩時間終了！作業を再開しましょう！';
            if (Notification.permission === 'granted') {
                new Notification('ポモドーロタイマー', { body: notificationText });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('ポモドーロタイマー', { body: notificationText });
                    }
                });
            }

            // 音声通知
            const audio = new Audio('/sounds/bell.mp3'); // 仮のパス
            audio.play();
        }

        // クリーンアップ関数：コンポーネトがアンマウントされたり、依存配列が変更されたりする際にインターバルをクリアする
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [time, isRunning, isWorking]);

    // コンポーネントがアンマウントされたときに最終的なクリーンアップを行う
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // フックの戻り値
    return {
        time,
        isRunning,
        isWorking,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleMode,
        WORK_TIME,
        BREAK_TIME,
    };
};

export default usePomodoroTimer; 