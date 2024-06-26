import { Menu, paperClasses, styled } from "@mui/material";

export const ArrowMenuTopBottom = styled(Menu)(({ theme }) => ({
  [`& .${paperClasses.root}`]: {
    overflowY: "visible",
    overflowX: "visible",
    "&:before": {
      content: '" "',
      display: "block",
      background: theme.palette.background.paper,
      width: 10,
      height: 10,
      transform: "rotate(45deg)",
      position: "absolute",
      margin: "auto",
      top: -5,
      left: "calc(100% - 40px)",
      right: 0,
    },
  },
}));

export const ArrowMenuBottomTop = styled(Menu)(({ theme }) => ({
  [`& .${paperClasses.root}`]: {
    overflowY: "visible",
    overflowX: "visible",
    "&:before": {
      content: '" "',
      display: "block",
      background: theme.palette.background.paper,
      width: 10,
      height: 10,
      transform: "rotate(45deg)",
      position: "absolute",
      margin: "auto",
      bottom: -5,
      left: 0,
      right: "calc(100% - 40px)",
    },
  },
}));
