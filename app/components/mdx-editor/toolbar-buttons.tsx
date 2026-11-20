import { FocusEvent, KeyboardEvent, ReactNode, useEffect, useRef } from "react";

import { Flex } from "@/components/flex";

const KEY_TO_INDEX: Record<
  string,
  ((index: number, count: number) => number) | undefined
> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_, count) => count - 1,
};

export const ToolbarButtons = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (ref.current) {
      setRovingTabIndex(getButtons(ref.current), activeIndexRef.current);
    }
  });

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    const buttons = getButtons(e.currentTarget);
    const index = buttons.findIndex(
      (button) => button === document.activeElement
    );

    if (index !== -1) {
      activeIndexRef.current = index;
      setRovingTabIndex(buttons, index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = getButtons(e.currentTarget);
    const index = buttons.findIndex(
      (button) => button === document.activeElement
    );
    const getNextIndex = KEY_TO_INDEX[e.key];

    if (index === -1 || !getNextIndex) {
      return;
    }

    e.preventDefault();
    buttons[getNextIndex(index, buttons.length)].focus();
  };

  return (
    <Flex ref={ref} gap={2} onFocus={handleFocus} onKeyDown={handleKeyDown}>
      {children}
    </Flex>
  );
};

const getButtons = (container: HTMLElement) => {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
  );
};

const setRovingTabIndex = (
  buttons: HTMLButtonElement[],
  activeIndex: number
) => {
  const index = Math.min(activeIndex, buttons.length - 1);
  buttons.forEach((button, i) => {
    button.tabIndex = i === index ? 0 : -1;
  });
};
