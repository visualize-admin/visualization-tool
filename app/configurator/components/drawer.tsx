import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "& > .MuiPaper-root": {
    top: 95.5,
    bottom: 0,
    height: "auto",
    borderLeft: `1px ${theme.palette.divider} solid`,
  },
}));
