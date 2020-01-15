import { useEffect, useState, useRef } from "react";
import { ResizeObserver } from "@juggle/resize-observer";

export const useResizeObserver = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [width, changeWidth] = useState(1);
  const [height, changeHeight] = useState(1);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const el = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
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

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, width, height] as const;
};
