import React from "react";

export const useTimedPrevious = <T>(value: T, duration: number): T => {
  const [previousValue, setPreviousValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPreviousValue(value);
    }, duration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, duration]);

  return previousValue;
};
