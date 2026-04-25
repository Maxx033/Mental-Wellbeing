import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for a countdown timer (default 60 seconds).
 * Returns { seconds, isRunning, start, pause, reset, progress }
 * where progress is 0→1 representing how far through the timer we are.
 */
export function useTimer(duration = 60) {
  const [seconds, setSeconds] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return clearTimer;
  }, [isRunning, seconds, clearTimer]);

  const start = useCallback(() => {
    if (seconds > 0) setIsRunning(true);
  }, [seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSeconds(duration);
  }, [duration, clearTimer]);

  const progress = 1 - seconds / duration;

  return { seconds, isRunning, start, pause, reset, progress };
}
