import { Drawer as MuiDrawer, DrawerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import { PANEL_HEADER_CSS_VAR } from "@/configurator/components/layout";

export const DRAWER_WIDTH = 340;

export const ConfiguratorDrawer = styled(MuiDrawer)(({ theme }) => ({
  "&": {
    /**
     * We use position static otherwise the Drawer is fixed and takes
     * the whole screen, blocking screen underneath.
     * */
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

export const RightDrawer = ({
  children,
  open,
  onClose,
  onExited,
}: {
  children: ReactNode;
  open?: DrawerProps["open"];
  onClose?: DrawerProps["onClose"];
  onExited?: () => void;
}) => {
  return (
    <MuiDrawer
      anchor="right"
      open={open}
      variant="temporary"
      onClose={onClose}
      SlideProps={{
        onExited: onExited,
      }}
      PaperProps={{
        sx: {
          width: 1400,
          maxWidth: "100%",
          p: 8,
        },
      }}
    >
      {children}
    </MuiDrawer>
  );
};
