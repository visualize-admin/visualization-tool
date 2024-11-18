import { ResizeObserver } from "@juggle/resize-observer";
import { useEventCallback } from "@mui/material";
import isEqual from "lodash/isEqual";
import throttle from "lodash/throttle";
import { useEffect, useRef, useState } from "react";

export const INIT_SIZE = 1;

export const useResizeObserver = <T extends Element>(
  cb?: (size: { width: number; height: number }) => void
) => {
  const roRef = useRef<ResizeObserver>();
  const elRef = useRef<T>();
  const [size, changeSize] = useState({ width: INIT_SIZE, height: INIT_SIZE });

  const handleRef = useEventCallback((node: T) => {
    if (!node) {
      return;
    }
    elRef.current = node;

    if (!roRef.current) {
      const resizeHandler = throttle((entries: ResizeObserverEntry[]) => {
        // Since we only observe the one element, we don't need to loop over the
        // array
        if (!entries.length) {
          return;
        }

        const entry = entries[0];

        const { width, height } = size;
        const { inlineSize: newWidth, blockSize: newHeight } =
          entry.contentBoxSize[0];
        // Prevent flickering when scrollbars appear and triggers another resize
        // by only resizing when difference to current measurement is above a certain threshold
        const newSize =
          (Math.abs(newHeight - height) > 16 && newHeight > 0) ||
          (Math.abs(newWidth - width) > 16 && newWidth > 0)
            ? { height: newHeight, width: newWidth }
            : size;

        if (isEqual(newSize, size)) {
          return;
        }

        changeSize(newSize);
        cb?.(newSize);
      }, 16);
      roRef.current = new ResizeObserver(resizeHandler);
    }

    roRef.current.observe(elRef.current);
  });

  useEffect(() => {
    if (elRef.current) {
      handleRef(elRef.current);
    }
    return () => {
      roRef.current?.disconnect();
      roRef.current = undefined;
    };
  }, [handleRef]);

  return [handleRef, size.width, size.height] as const;
};
