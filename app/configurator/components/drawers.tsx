import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";

import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import { PANEL_HEADER_CSS_VAR } from "@/configurator/components/layout";

export const DRAWER_WIDTH = 340;

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "&": {
    position: "static",
  },

  "& > .MuiPaper-root": {
    overflowX: "hidden",
    top: `calc(${HEADER_HEIGHT_CSS_VAR} + ${PANEL_HEADER_CSS_VAR})`,
    bottom: 0,
    width: DRAWER_WIDTH,
    height: "auto",
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
  },
}));
