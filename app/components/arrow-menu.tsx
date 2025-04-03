import { Menu, paperClasses, styled } from "@mui/material";

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

export const ArrowMenuTopCenter = styled(Menu)({
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

export const ArrowMenuBottomCenter = styled(Menu)({
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

export const ArrowMenuTopBottom = styled(Menu)({
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

export const ArrowMenuBottomTop = styled(Menu)({
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
