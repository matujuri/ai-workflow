/**
 * @brief 秒数を「MM:SS」形式の文字列にフォーマットする関数
 * @param seconds - フォーマットする秒数
 * @returns string - フォーマットされた時間文字列 (例: "25:00")
 */
export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}; 