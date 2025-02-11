import { useCallback, useEffect, useState } from "react";

type KeyCombo = {
  keys: string[];
  ctrlKey?: boolean;
  metaKey?: boolean;
};

type KeyHandler = (event: KeyboardEvent) => void;

export const useKeyboardShortcut = (
  keyCombo: KeyCombo,
  handler: KeyHandler,
  options: { preventDefault?: boolean } = {}
) => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const key = event.key.toLowerCase();
        if (!prev.includes(key)) {
          return [...prev, key];
        }
        return prev;
      });

      const targetKeys = keyCombo.keys.map((k) => k.toLowerCase());
      const currentKeys = [...pressedKeys, event.key.toLowerCase()];

      const hasAllKeys = targetKeys.every((k) => currentKeys.includes(k));
      const matchesCtrl =
        keyCombo.ctrlKey === undefined || event.ctrlKey === keyCombo.ctrlKey;
      const matchesMeta =
        keyCombo.metaKey === undefined || event.metaKey === keyCombo.metaKey;

      if (hasAllKeys && matchesCtrl && matchesMeta) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [keyCombo, handler, options.preventDefault, pressedKeys]
  );

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setPressedKeys((prev) => {
      const key = event.key.toLowerCase();
      return prev.filter((k) => k !== key);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
};
