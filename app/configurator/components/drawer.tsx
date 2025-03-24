import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";

import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";

export const DRAWER_WIDTH = 340;

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "&": {
    position: "static",
  },
  "& > .MuiPaper-root": {
    top: HEADER_HEIGHT_CSS_VAR,
    bottom: 0,
    width: DRAWER_WIDTH,
    height: "auto",
    outline: `1px ${theme.palette.divider} solid`,
    boxShadow: "none",
  },
}));
