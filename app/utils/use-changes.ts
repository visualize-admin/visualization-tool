import { useMemo, useRef } from "react";

type Changes<K, U> = (readonly [K, U, U])[];

const empty = [] as any[];
const useChanges = <T extends unknown, K extends unknown, U extends unknown>(
  currentValue: T,
  computeChanges: (prev: T, cur: T) => Changes<K, U>
) => {
  const prevRef = useRef<any>();
  const prevValue = prevRef.current;
  if (!prevValue) {
    prevRef.current = currentValue;
  }
  const changes = useMemo(
    () =>
      prevValue !== currentValue
        ? computeChanges(prevRef.current, currentValue)
        : (empty as Changes<K, U>),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [computeChanges, prevRef.current, currentValue]
  );
  prevRef.current = currentValue;
  return changes;
};

export default useChanges;
