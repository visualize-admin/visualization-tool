import { useCallback, useRef } from "react";

export const useFocusRequest = () => {
  const pendingKeyRef = useRef<string>();

  const requestFocus = useCallback((key: string) => {
    pendingKeyRef.current = key;
  }, []);

  const getFocusRef = useCallback(
    (key: string) => (node: HTMLElement | null) => {
      if (node && pendingKeyRef.current === key) {
        pendingKeyRef.current = undefined;
        node.focus();
      }
    },
    []
  );

  return { requestFocus, getFocusRef };
};
