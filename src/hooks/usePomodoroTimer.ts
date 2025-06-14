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
 * @param isBreakTimerActive - 現在が休憩タイマー中であるかを示すフラグ
 * @param breakTimeRemaining - 休憩タイマーの残り時間（秒単位）
 * @param isWorkTimeCompleted - 作業時間が完了したかどうかを示すフラグ
 * @param startBreak - 作業時間が完了した後に休憩タイマーを開始する関数
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
    isBreakTimerActive: boolean; // 休憩タイマーがアクティブか
    breakTimeRemaining: number; // 休憩タイマーの残り時間
    isWorkTimeCompleted: boolean; // 作業時間が完了したかどうかを示すフラグ
    startBreak: () => void; // 作業時間が完了した後に休憩タイマーを開始する関数
}

// ポモドーロ作業時間（25分を秒に変換）
const WORK_TIME = 5;
// ポモドーロ休憩時間（5分を秒に変換）
const BREAK_TIME = 3;

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
    // 休憩タイマーがアクティブかどうかの状態
    const [isBreakTimerActive, setIsBreakTimerActive] = useState(false);
    // 休憩タイマーの残り時間状態
    const [breakTimeRemaining, setBreakTimeRemaining] = useState(BREAK_TIME);
    // 作業時間が完了したかどうかの状態
    const [isWorkTimeCompleted, setIsWorkTimeCompleted] = useState(false);
    // setIntervalのIDを保持するためのref
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // isWorkingの状態が変更されたときに、タイマーの残り時間を初期化する
    // ただし、isWorkTimeCompletedがtrueの場合はtimeを0に保つ
    useEffect(() => {
        if (!isWorkTimeCompleted) { // 作業完了状態でない場合のみ、モードに応じて時間を設定
            setTime(isWorking ? WORK_TIME : BREAK_TIME);
        } else {
            setTime(0); // 作業完了状態なら時間を0に固定
        }
    }, [isWorking, isWorkTimeCompleted, WORK_TIME, BREAK_TIME]); // 依存配列にWORK_TIMEとBREAK_TIMEを追加

    // 休憩タイマーのカウントダウンロジック
    useEffect(() => {
        let breakInterval: NodeJS.Timeout | null = null;
        if (isBreakTimerActive && breakTimeRemaining > 0) {
            breakInterval = setInterval(() => {
                setBreakTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (isBreakTimerActive && breakTimeRemaining === 0) {
            // 休憩時間が終了したら、タイマーをリセットし作業モードに戻す
            setIsBreakTimerActive(false);
            setIsWorking(true);
            setTime(WORK_TIME);
            setIsRunning(false); // 自動では開始しない
            setBreakTimeRemaining(BREAK_TIME); // 次の休憩のためにリセット
        }

        return () => {
            if (breakInterval) {
                clearInterval(breakInterval);
            }
        };
    }, [isBreakTimerActive, breakTimeRemaining]);

    /**
     * @brief タイマーを開始する関数
     * タイマーが停止している場合のみ実行中状態にする。
     * @param なし
     * @returns なし
     */
    const startTimer = useCallback(() => {
        setIsRunning(true);
    }, []);

    /**
     * @brief タイマーを一時停止する関数
     * タイマーが実行中の場合のみ停止状態にする。
     * @param なし
     * @returns なし
     */
    const pauseTimer = useCallback(() => {
        setIsRunning(false);
    }, []);

    /**
     * @brief タイマーをリセットする関数
     * タイマーを停止し、作業モードに戻し、残り時間を初期作業時間に戻す。
     * 休憩タイマーもリセットする。
     * @param なし
     * @returns なし
     */
    const resetTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
        setIsWorking(true);
        setTime(WORK_TIME);
        setIsBreakTimerActive(false);
        setBreakTimeRemaining(BREAK_TIME);
        setIsWorkTimeCompleted(false);
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
            // 休憩タイマー終了後、isWorkTimeCompletedをfalseにする
            if (!newIsWorking) { // 作業モードから休憩モードへ
                setIsWorkTimeCompleted(false);
            }
            setTime(newIsWorking ? WORK_TIME : BREAK_TIME);
            return newIsWorking;
        });
    }, [WORK_TIME, BREAK_TIME]);

    /**
     * @brief 作業時間が完了した後に休憩タイマーを開始する関数
     * @param なし
     * @returns なし
     */
    const startBreak = useCallback(() => {
        setIsWorking(false);
        setIsRunning(true);
        setIsBreakTimerActive(true);
        setBreakTimeRemaining(BREAK_TIME);
    }, []);

    // タイマーのカウントダウンロジックと通知処理
    useEffect(() => {
        if (isRunning && time > 0) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isRunning && time === 0) {
            setIsRunning(false);

            // 音声通知
            const audio = new Audio('/sounds/bell.mp3');
            audio.play();

            if (isWorking) {
                // 作業時間が終了した場合
                setIsWorkTimeCompleted(true); // 作業完了状態を設定
                setIsBreakTimerActive(true); // 休憩タイマーがアクティブであることを示す（App.tsxでの表示用）
                setBreakTimeRemaining(BREAK_TIME); // 休憩時間をリセット（表示用）
                setTime(0); // 作業時間が終了したらtimeを0に固定
                // ここではisWorkingを切り替えない。ユーザーのクリックを待つ。
            } else {
                // 休憩時間が終了した場合
                setIsWorkTimeCompleted(false);
                setIsBreakTimerActive(false);
                setIsWorking(true); // 作業モードに戻す
                setTime(WORK_TIME); // 作業時間をリセット
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [time, isRunning, isWorking, resetTimer, startBreak, setIsBreakTimerActive, setIsWorkTimeCompleted, setBreakTimeRemaining]);

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
        isBreakTimerActive,
        breakTimeRemaining,
        isWorkTimeCompleted,
        startBreak,
    };
};

export default usePomodoroTimer; 