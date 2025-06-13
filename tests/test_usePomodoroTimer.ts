import { renderHook } from '@testing-library/react/pure';
import { act } from '@testing-library/react';
import usePomodoroTimer from '../src/hooks/usePomodoroTimer';
import { formatTime } from '../src/utils/timer';

describe('formatTime', () => {
    it('should format seconds into MM:SS format', () => {
        expect(formatTime(0)).toBe('00:00');
        expect(formatTime(59)).toBe('00:59');
        expect(formatTime(60)).toBe('01:00');
        expect(formatTime(300)).toBe('05:00');
        expect(formatTime(1500)).toBe('25:00');
        expect(formatTime(3661)).toBe('61:01');
    });
});

describe('usePomodoroTimer', () => {
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should initialize with work time and not running', () => {
        const { result } = renderHook(() => usePomodoroTimer());
        expect(result.current.time).toBe(WORK_TIME);
        expect(result.current.isRunning).toBe(false);
        expect(result.current.isWorking).toBe(true);
    });

    it('should start and pause the timer', async () => {
        const { result } = renderHook(() => usePomodoroTimer());

        await act(async () => {
            result.current.startTimer();
        });
        // Ensure startTimer() effects are flushed and setInterval is set
        await act(async () => { });
        expect(result.current.isRunning).toBe(true);

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.time).toBe(WORK_TIME - 1);

        await act(async () => {
            result.current.pauseTimer();
        });
        expect(result.current.isRunning).toBe(false);

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.time).toBe(WORK_TIME - 1); // Time should not change when paused
    });

    it('should reset the timer', async () => {
        const { result } = renderHook(() => usePomodoroTimer());

        await act(async () => {
            result.current.startTimer();
        });
        // Ensure startTimer() effects are flushed and setInterval is set
        await act(async () => { });

        await act(async () => {
            vi.advanceTimersByTime(5000);
        });
        // Ensure all effects from timer advancement are flushed
        await act(async () => { });

        expect(result.current.time).toBe(WORK_TIME - 5);

        await act(async () => {
            result.current.resetTimer();
        });
        // Ensure all effects from resetTimer() are flushed
        await act(async () => { });
        expect(result.current.time).toBe(WORK_TIME);
        expect(result.current.isRunning).toBe(false);
        expect(result.current.isWorking).toBe(true);
    });

    it('should switch to break time when work time ends', async () => {
        const { result } = renderHook(() => usePomodoroTimer());

        await act(async () => {
            result.current.startTimer();
        });
        // Ensure startTimer() effects are flushed and setInterval is set
        await act(async () => { });

        await act(async () => {
            vi.advanceTimersByTime(WORK_TIME * 1000);
        });

        // Ensure all effects from time === 0 (timer end, notification, toggleMode) are flushed
        await act(async () => { });

        expect(result.current.isWorking).toBe(false); // Should be in break mode
        expect(result.current.time).toBe(BREAK_TIME); // Time should be reset to break time
        expect(result.current.isRunning).toBe(false); // Timer should be paused after mode switch
    });

    it('should switch back to work time when break time ends', async () => {
        const { result } = renderHook(() => usePomodoroTimer());

        await act(async () => {
            result.current.startTimer();
        });
        // Ensure startTimer() effects are flushed and setInterval is set
        await act(async () => { });

        await act(async () => {
            vi.advanceTimersByTime(WORK_TIME * 1000);
        });
        // Now in break mode, ensure effects are flushed (timer end, notification, toggleMode)
        await act(async () => { });

        await act(async () => {
            result.current.startTimer(); // Start break timer
        });
        // Ensure startTimer() effects are flushed and setInterval is set (for break timer)
        await act(async () => { });

        await act(async () => {
            vi.advanceTimersByTime(BREAK_TIME * 1000);
        });
        // Ensure all effects from time === 0 (timer end, notification, toggleMode) are flushed
        await act(async () => { });

        expect(result.current.isWorking).toBe(true); // Should be back in work mode
        expect(result.current.time).toBe(WORK_TIME);
        expect(result.current.isRunning).toBe(false);
        expect(result.current.isWorking).toBe(true);
    });
}); 