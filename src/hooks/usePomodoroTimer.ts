import { useState, useEffect, useCallback } from 'react';
import { getPomodoroSetting, WORK_TIME_KEY, BREAK_TIME_KEY, DEFAULT_WORK_TIME, DEFAULT_BREAK_TIME } from '../stores/pomodoroSettingsStore';

/**
 * @interface UsePomodoroTimerReturn
 * @brief usePomodoroTimerフックの戻り値の型定義
 * @param time - ポモドーロタイマーの残り時間（秒単位）
 * @param isRunning - タイマーが現在実行中であるかを示すフラグ
 * @param isWorking - 現在が作業時間であるか（true）休憩時間であるか（false）を示すフラグ
 * @param startTimer - タイマーを開始する関数
 * @param pauseTimer - タイマーを一時停止する関数
 * @param resumeTimer - 一時停止中のタイマーを再開する関数
 * @param stopTimer - タイマーを停止する関数
 * @param toggleMode - 作業時間と休憩時間を切り替える関数
 * @param workTimeSetting - 設定された作業時間（秒）
 * @param breakTimeSetting - 設定された休憩時間（秒）
 * @param initialPomodoroTime - ポモドーロ開始時点の総時間（秒）
 * @param isTimerActive - タイマーが現在アクティブな状態であるかを示すフラグ
 */
interface UsePomodoroTimerReturn {
    time: number; // 秒単位の残り時間
    isRunning: boolean; // タイマーが実行中か
    isWorking: boolean; // 現在が作業時間か
    startTimer: () => void; // タイマーを開始する関数
    pauseTimer: () => void; // タイマーを一時停止する関数
    resumeTimer: () => void; // 一時停止中のタイマーを再開する関数
    stopTimer: () => void; // タイマーを停止する関数
    toggleMode: () => void; // 作業時間と休憩時間を切り替える関数
    workTimeSetting: number; // 設定された作業時間（秒）
    breakTimeSetting: number; // 設定された休憩時間（秒）
    initialPomodoroTime: number; // ポモドーロ開始時点の総時間（秒）
    isTimerActive: boolean; // タイマーがアクティブな状態か
}

/**
 * @brief ポモドーロタイマーのロジックを提供するカスタムReactフック
 * @returns UsePomodoroTimerReturn - タイマーの状態と操作関数
 */
const usePomodoroTimer = (): UsePomodoroTimerReturn => {
    // 初期設定時間をLocal Storageから取得 (これはService Workerに初期値を設定するために残す)
    const initialWorkTime = getPomodoroSetting(WORK_TIME_KEY, DEFAULT_WORK_TIME);
    const initialBreakTime = getPomodoroSetting(BREAK_TIME_KEY, DEFAULT_BREAK_TIME);

    // タイマーの残り時間状態
    const [time, setTime] = useState(initialWorkTime);
    // タイマーが実行中かどうかの状態
    const [isRunning, setIsRunning] = useState(false);
    // 現在が作業時間か休憩時間かの状態（true: 作業時間, false: 休憩時間）
    const [isWorking, setIsWorking] = useState(true);
    // ポモドーロ開始時点の総時間
    const [initialPomodoroTime, setInitialPomodoroTime] = useState(initialWorkTime);

    // 設定時間をstateとして保持し、UIに公開する
    const [workTimeSetting, setWorkTimeSetting] = useState(initialWorkTime);
    const [breakTimeSetting, setBreakTimeSetting] = useState(initialBreakTime);
    // タイマーがアクティブな状態か
    const [isTimerActive, setIsTimerActive] = useState(false);

    // Service Workerへのメッセージ送信ヘルパー関数
    const postMessageToServiceWorker = useCallback(async (type: string, payload?: any) => {
        if (!navigator.serviceWorker) {
            console.warn('Service Worker not supported.');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                registration.active.postMessage({ type, payload });
            } else {
                console.warn('Service Worker active controller not available.');
            }
        } catch (error) {
            console.error('Error sending message to Service Worker:', error);
        }
    }, []);

    // Local Storageの値が変更された際に設定を更新し、Service Workerにも通知するeffect
    useEffect(() => {
        const handleStorageChange = () => {
            const newWorkTime = getPomodoroSetting(WORK_TIME_KEY, DEFAULT_WORK_TIME);
            const newBreakTime = getPomodoroSetting(BREAK_TIME_KEY, DEFAULT_BREAK_TIME);
            setWorkTimeSetting(newWorkTime);
            setBreakTimeSetting(newBreakTime);
            // Service Workerに設定更新を通知
            postMessageToServiceWorker('UPDATE_TIMER_SETTINGS', {
                workTime: newWorkTime / 60, // 秒から分に戻して渡す
                breakTime: newBreakTime / 60, // 秒から分に戻して渡す
            });
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [postMessageToServiceWorker]);

    // Service Workerからのメッセージを受信し、状態を更新するeffect
    useEffect(() => {
        const handleMessage = (event: Event) => {
            const messageEvent = event as MessageEvent;
            if (messageEvent.data && messageEvent.data.type === 'TIMER_STATE_UPDATE') {
                const { time, isRunning, isWorking, initialPomodoroTime, workTimeSetting, breakTimeSetting, isTimerActive } = messageEvent.data.payload;
                setTime(time);
                setIsRunning(isRunning);
                setIsWorking(isWorking);
                setInitialPomodoroTime(initialPomodoroTime);
                setWorkTimeSetting(workTimeSetting);
                setBreakTimeSetting(breakTimeSetting);
                setIsTimerActive(isTimerActive);
            }
        };
        // Service Workerからのメッセージリスナーを登録
        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', handleMessage);
        }
        return () => {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    // コンポーネントマウント時にService Workerにタイマー状態を要求
    // また、Service Workerに初期設定を同期する
    useEffect(() => {
        // Service Workerがアクティブになるまで待機し、状態を要求
        postMessageToServiceWorker('REQUEST_TIMER_STATE');
        postMessageToServiceWorker('UPDATE_TIMER_SETTINGS', {
            workTime: initialWorkTime / 60, // 秒から分に戻して渡す
            breakTime: initialBreakTime / 60, // 秒から分に戻して渡す
        });
    }, [postMessageToServiceWorker, initialWorkTime, initialBreakTime]);

    /**
     * @brief タイマーを開始する関数
     * Service Workerにタイマー開始を指示する。
     * @param なし
     * @returns なし
     */
    const startTimer = useCallback(() => {
        postMessageToServiceWorker('START_TIMER');
    }, [postMessageToServiceWorker]);

    /**
     * @brief タイマーを一時停止する関数
     * Service Workerにタイマー一時停止を指示する。
     * @param なし
     * @returns なし
     */
    const pauseTimer = useCallback(() => {
        postMessageToServiceWorker('PAUSE_TIMER');
    }, [postMessageToServiceWorker]);

    /**
     * @brief 一時停止中のタイマーを再開する関数
     * Service Workerにタイマー再開を指示する。
     * @param なし
     * @returns なし
     */
    const resumeTimer = useCallback(() => {
        postMessageToServiceWorker('RESUME_TIMER');
    }, [postMessageToServiceWorker]);

    /**
     * @brief タイマーを停止する関数
     * Service Workerにタイマー停止を指示する。
     * @param なし
     * @returns なし
     */
    const stopTimer = useCallback(() => {
        postMessageToServiceWorker('STOP_TIMER');
    }, [postMessageToServiceWorker]);

    /**
     * @brief 作業時間と休憩時間を切り替える関数
     * Service Workerにモード切り替えを指示する。
     * @param なし
     * @returns なし
     */
    const toggleMode = useCallback(() => {
        postMessageToServiceWorker('TOGGLE_MODE');
    }, [postMessageToServiceWorker]);

    // フックの戻り値
    return {
        time,
        isRunning,
        isWorking,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        toggleMode,
        workTimeSetting,
        breakTimeSetting,
        initialPomodoroTime,
        isTimerActive,
    };
};

export default usePomodoroTimer; 