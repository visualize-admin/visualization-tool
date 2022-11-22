import { Button, Drawer, IconButton, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import SvgIcClose from "@/icons/components/IcClose";
import useEvent from "@/utils/use-event";

type State = {
  open: boolean;
  toggle: () => void;
};

const Context = React.createContext<State | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);

  const ctx = React.useMemo(() => {
    return {
      open,
      toggle: () => setOpen(!open),
    };
  }, [open, setOpen]);

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export const useContext = () => {
  const ctx = React.useContext(Context);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ContextProvider /> to useContext()"
    );
  }

  return ctx;
};

const useStyles = makeStyles<Theme, { drawerTop?: number }>((theme) => {
  return {
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(4),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    content: {
      width: DRAWER_WIDTH,
      padding: theme.spacing(4),
    },
    drawer: {
      position: "static",

      "& > .MuiPaper-root": {
        top: ({ drawerTop }) => drawerTop,
        bottom: 0,
        height: "auto",
        borderRight: `1px ${theme.palette.divider} solid`,
        boxShadow: "none",
      },
    },
  };
});

export const MetadataPanel = ({
  container,
  top,
}: {
  container?: HTMLDivElement | null;
  top?: number;
}) => {
  return (
    <ContextProvider>
      <PanelInner container={container} top={top} />
    </ContextProvider>
  );
};

const ToggleButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button component="a" variant="text" size="small" onClick={onClick}>
      <Typography variant="body2">Metadata</Typography>
    </Button>
  );
};

const Header = ({ onClose }: { onClose: () => void }) => {
  const classes = useStyles({});

  return (
    <div className={classes.header}>
      <Typography variant="body2" fontWeight="bold">
        Metadata
      </Typography>

      <IconButton size="small" onClick={onClose}>
        <SvgIcClose />
      </IconButton>
    </div>
  );
};

const Content = () => {
  const classes = useStyles({});

  return <div className={classes.content}></div>;
};

const PanelInner = ({
  container,
  top = 0,
}: {
  container: HTMLDivElement | null | undefined;
  top?: number;
}) => {
  const classes = useStyles({ drawerTop: top });
  const { open, toggle } = useContext();
  const handleToggle = useEvent(() => {
    toggle();
  });

  return (
    <>
      <ToggleButton onClick={handleToggle} />

      <Drawer
        className={classes.drawer}
        open={open}
        anchor="left"
        hideBackdrop
        ModalProps={{ container }}
        PaperProps={{ style: { position: "absolute" } }}
      >
        <Header onClose={handleToggle} />
        <Content />
      </Drawer>
    </>
  );
};
