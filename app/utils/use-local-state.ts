import { SetStateAction, useCallback, useEffect, useState } from "react";

const useLocalState = <T>(
  key: string,
  initialValue: T
): [T, (value: SetStateAction<T>) => void] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const updateState = useCallback((value: SetStateAction<T>) => {
    setState(value);
  }, []);

  return [state, updateState];
};

export default useLocalState;
