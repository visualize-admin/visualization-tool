import { useMemo, useRef, useState } from "react";

import {
  ArrowMenuBottomCenter,
  ArrowMenuTopCenter,
} from "@/components/arrow-menu";
import { useEvent } from "@/utils/use-event";

const MENU_ITEM_HEIGHT = 40;

type FlipMenuOrigin = {
  vertical: "top" | "bottom";
  horizontal: "center";
};

export const useFlipMenu = ({ itemsCount }: { itemsCount: number }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
  const [anchorOrigin, setAnchorOrigin] = useState<FlipMenuOrigin>({
    vertical: "bottom",
    horizontal: "center",
  });
  const [transformOrigin, setTransformOrigin] = useState<FlipMenuOrigin>({
    vertical: "top",
    horizontal: "center",
  });

  const handleOpenElClick = useEvent(() => {
    const openEl = buttonRef.current;

    if (!openEl) {
      return;
    }

    setAnchorEl(openEl);

    const { top, bottom } = openEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - bottom;
    const spaceAbove = top;
    const threshold = MENU_ITEM_HEIGHT * itemsCount + 16;

    if (spaceBelow < threshold && spaceAbove > spaceBelow) {
      setAnchorOrigin({ vertical: "top", horizontal: "center" });
      setTransformOrigin({ vertical: "bottom", horizontal: "center" });
    } else {
      setAnchorOrigin({ vertical: "bottom", horizontal: "center" });
      setTransformOrigin({ vertical: "top", horizontal: "center" });
    }
  });

  const handleClose = useEvent(() => {
    setAnchorEl(null);
  });

  const Wrapper = useMemo(() => {
    switch (anchorOrigin.vertical) {
      case "bottom":
        return ArrowMenuTopCenter;
      case "top":
        return ArrowMenuBottomCenter;
      default:
        return ArrowMenuTopCenter;
    }
  }, [anchorOrigin.vertical]);

  return {
    handleOpenElClick,
    handleClose,
    Wrapper,
    anchorEl,
    buttonRef,
    anchorOrigin,
    transformOrigin,
  };
};
