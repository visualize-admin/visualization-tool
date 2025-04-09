import { Drawer as MuiDrawer } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

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

export const RightDrawer = ({
  children,
  open,
  onClose,
  onExited,
}: {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
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
          px: 8,
        },
      }}
    >
      {children}
    </MuiDrawer>
  );
};
