import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";

import { BANNER_MARGIN_TOP } from "@/components/presence";

export const DRAWER_WIDTH = 340;

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "&": {
    position: "static",
  },
  "& > .MuiPaper-root": {
    top: BANNER_MARGIN_TOP,
    bottom: 0,
    width: DRAWER_WIDTH,
    height: "auto",
    borderRight: `1px ${theme.palette.divider} solid`,
    boxShadow: "none",
  },
}));
