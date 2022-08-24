import { useLayoutEffect, useMemo, useRef } from "react";

type Fn<ARGS extends unknown[], R> = (...args: ARGS) => R;

/**
 * Used for event handlers.
 * Like useCallback but no need to specify dependencies.
 * The result is stable.
 * Can be replaced by React's own useEvent if/when it gets implemented.
 *
 * @see https://github.com/reactjs/rfcs/pull/220
 */
const useEvent = <A extends unknown[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = useRef<Fn<A, R>>(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useMemo(
    () =>
      (...args: A): R => {
        const { current } = ref;
        return current(...args);
      },
    []
  );
};

export default useEvent;
