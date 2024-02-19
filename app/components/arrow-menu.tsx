import { Menu, paperClasses, styled } from "@mui/material";

export const ArrowMenu = styled(Menu)(({ theme }) => ({
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

      left: 0,
      right: 0,
    },
  },
}));
