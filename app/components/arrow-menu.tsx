import { paperClasses, Popover, styled } from "@mui/material";

import { ActionMenu } from "@/components/action-menu";

const commonBeforeStyles: Partial<CSSStyleDeclaration> = {
  content: '" "',
  position: "absolute",
  display: "block",
  width: "10px",
  height: "10px",
  margin: "auto",
  background: "white",
  transform: "rotate(45deg)",
};

const topCenterStyles = {
  [`& .${paperClasses.root}`]: {
    overflow: "visible",
    "&:before": {
      ...commonBeforeStyles,
      top: -5,
      left: "0%",
      right: 0,
    },
  },
};

export const ArrowMenuTopCenter = styled(ActionMenu)(topCenterStyles);

export const ArrowPopoverTopCenter = styled(Popover)(topCenterStyles);

export const ArrowMenuBottomCenter = styled(ActionMenu)({
  [`& .${paperClasses.root}`]: {
    overflow: "visible",
    "&:before": {
      ...commonBeforeStyles,
      bottom: -5,
      left: "0%",
      right: 0,
    },
  },
});

export const ArrowMenuTopBottom = styled(ActionMenu)({
  [`& .${paperClasses.root}`]: {
    overflow: "visible",
    "&:before": {
      ...commonBeforeStyles,
      top: -5,
      left: "0%",
      right: 0,
    },
  },
});

export const ArrowMenuBottomTop = styled(ActionMenu)({
  [`& .${paperClasses.root}`]: {
    overflow: "visible",
    "&:before": {
      ...commonBeforeStyles,
      bottom: -5,
      left: 0,
      right: "0%",
    },
  },
});
