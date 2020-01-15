import { useEffect, useState, useRef } from "react";
import { ResizeObserver } from "@juggle/resize-observer";

export const useResizeObserver = <T extends Element>() => {
  const roRef = useRef<ResizeObserver>()
  const elRef = useRef<T>(null);
  const [width, changeWidth] = useState(1);
  const [height, changeHeight] = useState(1);

  useEffect(() => {
    if (!elRef.current) {
      return;
    }

    if (!roRef.current) {
      roRef.current = new ResizeObserver(entries => {
        // Since we only observe the one element, we don't need to loop over the
        // array
        if (!entries.length) {
          return;
        }
  
        const entry = entries[0];
  
        const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
  
        changeWidth(width);
        changeHeight(height);
      });
    }

    roRef.current.observe(elRef.current);

    return () => {
      roRef.current?.disconnect();
    };
  }, []);

  return [elRef, width, height] as const;
};
