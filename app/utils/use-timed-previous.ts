import { useEffect, useState } from "react";

export const useTimedPrevious = <T>(value: T, duration: number): T => {
  const [previousValue, setPreviousValue] = useState<T>(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPreviousValue(value);
    }, duration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, duration]);

  return previousValue;
};
