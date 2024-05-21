import { ResizeObserver } from "@juggle/resize-observer";
import { useEventCallback } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const useResizeObserver = <T extends Element>() => {
  const roRef = useRef<ResizeObserver>();
  const elRef = useRef<T>();
  const [width, changeWidth] = useState(1);
  const [height, changeHeight] = useState(1);

  const handleRef = useEventCallback((node: T) => {
    if (!node) {
      return;
    }
    elRef.current = node;

    if (!roRef.current) {
      roRef.current = new ResizeObserver((entries) => {
        // Since we only observe the one element, we don't need to loop over the
        // array
        if (!entries.length) {
          return;
        }

        const entry = entries[0];

        const { inlineSize: newWidth, blockSize: newHeight } =
          entry.contentBoxSize[0];

        // Prevent flickering when scrollbars appear and triggers another resize
        // by only resizing when difference to current measurement is above a certain threshold
        changeWidth((width) =>
          Math.abs(newWidth - width) > 16 && newWidth > 0 ? newWidth : width
        );
        changeHeight((height) =>
          Math.abs(newHeight - height) > 16 && newHeight > 0
            ? newHeight
            : height
        );
      });
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

  return [handleRef, width, height] as const;
};
