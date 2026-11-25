import { ResizeObserver } from "@juggle/resize-observer";
import { useEffect, useRef, useState } from "react";

export const readHeight = (element: HTMLElement) => element.offsetHeight;

export const readHorizontalScrollbarHeight = (element: HTMLElement) =>
  element.offsetHeight - element.clientHeight;

/** Keeps a measured height up to date while the element resizes. `read` must be stable. */
export const useObservedHeight = ({
  element,
  read,
  initial,
}: {
  element: HTMLElement | null;
  read: (element: HTMLElement) => number;
  initial: number;
}) => {
  const [height, setHeight] = useState(initial);

  useEffect(() => {
    if (!element) {
      return;
    }

    const update = () => {
      setHeight(read(element));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, read]);

  return height;
};

/** While searching, keeps at least the height from before the search, so content below doesn't move with every keystroke. */
export const useHeightWhileSearching = (
  height: number,
  isSearching: boolean
) => {
  const heightBeforeSearch = useRef(height);

  if (!isSearching) {
    heightBeforeSearch.current = height;
  }

  return isSearching ? Math.max(height, heightBeforeSearch.current) : height;
};
