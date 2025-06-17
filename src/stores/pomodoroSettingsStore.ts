/**
 * @file ポモドーロタイマー設定をLocal Storageに保存・読み込みするためのストア
 */

// Local Storageのキー
export const WORK_TIME_KEY = 'pomodoroWorkTime';
export const BREAK_TIME_KEY = 'pomodoroBreakTime';

// デフォルトのポモドーロ作業時間（25分を秒に変換）
export const DEFAULT_WORK_TIME = 25 * 60;
// デフォルトのポモドーロ休憩時間（5分を秒に変換）
export const DEFAULT_BREAK_TIME = 5 * 60;

/**
 * @brief 指定されたキーでLocal Storageからポモドーロ設定を読み込む関数
 * @param key - Local Storageのキー
 * @param defaultValue - 値が見つからない場合や無効な場合のデフォルト値（秒単位）
 * @returns number - 読み込まれた設定値（秒単位）、またはデフォルト値
 */
export const getPomodoroSetting = (key: string, defaultValue: number): number => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        const parsedValue = parseInt(storedValue, 10);
        // 1分未満は無効なため、最小値を60秒に設定
        return isNaN(parsedValue) || parsedValue <= 0 ? defaultValue : parsedValue;
    }
    return defaultValue;
};

/**
 * @brief 指定されたキーと値でLocal Storageにポモドーロ設定を保存する関数
 * @param key - Local Storageのキー
 * @param valueInMinutes - 保存する設定値（分単位）
 * @returns void
 */
export const savePomodoroSetting = (key: string, valueInMinutes: number): void => {
    localStorage.setItem(key, (valueInMinutes * 60).toString());
}; 