import { useEffect, useState, useRef } from "react";
import ResizeObserver from "resize-observer-polyfill";

export const useResizeObserver = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, changeWidth] = useState(1);
  const [height, changeHeight] = useState(1);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const el = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
      if (!Array.isArray(entries)) {
        return;
      }

      // Since we only observe the one element, we don't need to loop over the
      // array
      if (!entries.length) {
        return;
      }

      const entry = entries[0];

      changeWidth(entry.contentRect.width);
      changeHeight(entry.contentRect.height);
    });

    resizeObserver.observe(el);

    return () => resizeObserver.unobserve(el);
  }, []);

  return [ref, width, height] as const;
};
