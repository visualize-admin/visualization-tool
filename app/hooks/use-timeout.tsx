import { useEffect, useState } from "react";

/**
 * Becomes true after the specified duration has passed. Is reset when `reset` changes.
 */
export const useTimeout = (duration: number, reset: boolean): boolean => {
  const [isTimeoutReached, setIsTimeoutReached] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTimeoutReached(true);
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, [duration, reset]);

  useEffect(() => {
    setIsTimeoutReached(false);
  }, [reset]);

  return isTimeoutReached;
};
