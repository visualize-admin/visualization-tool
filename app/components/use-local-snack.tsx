import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

/**
 * Holds a temporary snack state
 */
export const useLocalSnack = () => {
  type Snack = {
    message: string | ReactNode;
    variant: "success" | "error";
    duration?: number;
  };
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [snack, setSnack] = useState(undefined as Snack | undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [
    snack,
    useCallback(function enqueue(snack: Snack | undefined) {
      setSnack(snack);
      if (snack) {
        timeoutRef.current = setTimeout(() => {
          setSnack(undefined);
        }, snack.duration || 5000);
      }
    }, []),

    useCallback(function dismiss() {
      setSnack(undefined);
    }, []),
  ] as const;
};
