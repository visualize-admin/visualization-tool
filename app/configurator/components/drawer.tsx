import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";

export const DRAWER_WIDTH = 340;

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "&": {
    position: "static",
  },
  "& > .MuiPaper-root": {
    top: 96,
    bottom: 0,
    height: "auto",
    borderLeft: `1px ${theme.palette.divider} solid`,
    borderRight: `1px ${theme.palette.divider} solid`,
    boxShadow: "none",
  },
}));
