import { useCallback, useRef } from "react";

export const useFocusRequest = <Key extends string>() => {
  const pendingKeyRef = useRef<Key>();

  const requestFocus = useCallback((key: Key) => {
    pendingKeyRef.current = key;
  }, []);

  const getFocusRef = useCallback(
    (key: Key) => (node: HTMLElement | null) => {
      if (node && pendingKeyRef.current === key) {
        pendingKeyRef.current = undefined;
        node.focus();
      }
    },
    []
  );

  return { requestFocus, getFocusRef };
};
