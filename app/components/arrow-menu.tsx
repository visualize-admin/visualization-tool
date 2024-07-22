import { Menu, paperClasses, styled } from "@mui/material";

const commonBeforeStyles: Partial<CSSStyleDeclaration> = {
  content: '" "',
  display: "block",
  background: "white",
  width: "10px",
  height: "10px",
  transform: "rotate(45deg)",
  position: "absolute",
  margin: "auto",
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

export const ArrowMenuTopBottom = styled(Menu)({
  [`& .${paperClasses.root}`]: {
    overflow: "visible",
    "&:before": {
      ...commonBeforeStyles,
      top: -5,
      left: "calc(100% - 40px)",
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
      right: "calc(100% - 40px)",
    },
  },
});
