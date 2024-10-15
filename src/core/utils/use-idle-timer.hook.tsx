import { useCallback, useEffect, useRef, useState } from "react";

interface IUseIdleTimerType {
  isTimerOver: boolean;
  timeLeft: number;
}

/**
 * Custom React hook to track user inactivity and manage idle time.
 *
 * @param {number} duration - The duration in seconds after which the timer is considered over.
 *   Defaults to 600 seconds.
 * @returns {IUseIdleTimerType} An object containing `isTimerOver`, indicating if the timer has
 *   finished, and `timeLeft`, the remaining time in seconds.
 */
const useIdleTimer = (duration = 600): IUseIdleTimerType => {
  const [isActive, setIsActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTimerOver, setIsTimerOver] = useState(false);
  const intervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsActive(true);
    setTimeLeft(duration);
    setIsTimerOver(false);
  }, [duration]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];
    const debouncedHandleActivity = debounce(handleActivity, 100);

    events.forEach((event) => window.addEventListener(event, debouncedHandleActivity));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, debouncedHandleActivity));
    };
  }, [handleActivity, resetTimer]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000) as unknown as null;
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsTimerOver(true);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // Debounce function to limit how often a function can run
  function debounce(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        timeout = undefined;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return { isTimerOver, timeLeft };
};

export default useIdleTimer;
