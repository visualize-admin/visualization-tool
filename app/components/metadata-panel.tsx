import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Button,
  Drawer,
  IconButton,
  Tab,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import SvgIcClose from "@/icons/components/IcClose";
import useEvent from "@/utils/use-event";

type Section = "general" | "data";

type State = {
  open: boolean;
  toggle: () => void;
  activeSection: Section;
  setActiveSection: (d: Section) => void;
};

const Context = React.createContext<State | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<Section>("general");

  const ctx = React.useMemo(() => {
    return {
      open,
      toggle: () => setOpen(!open),
      activeSection,
      setActiveSection,
    };
  }, [open, activeSection]);

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
    drawer: {
      position: "static",

      "& > .MuiPaper-root": {
        top: ({ drawerTop }) => drawerTop,
        bottom: 0,
        width: DRAWER_WIDTH + 1,
        height: "auto",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        borderRight: `1px ${theme.palette.divider} solid`,
        boxShadow: "none",
      },
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(4),
    },
    content: {
      padding: theme.spacing(4),
    },
    tabList: {
      height: 40,
      minHeight: 40,
      marginBottom: theme.spacing(4),

      "& .MuiTab-root": {
        height: 40,
        minHeight: 40,
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
  const { open, toggle, activeSection, setActiveSection } = useContext();
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

        <TabContext value={activeSection}>
          <TabList
            className={classes.tabList}
            onChange={(_, v) => {
              setActiveSection(v);
            }}
          >
            <Tab
              value="general"
              label={
                <Typography variant="body2" fontWeight="bold">
                  General
                </Typography>
              }
            />
            <Tab
              value="data"
              label={
                <Typography variant="body2" fontWeight="bold">
                  Data
                </Typography>
              }
            />
          </TabList>

          <TabPanel value="general">General</TabPanel>
          <TabPanel value="data">Data</TabPanel>
        </TabContext>

        <Content />
      </Drawer>
    </>
  );
};
