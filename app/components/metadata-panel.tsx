import { t, Trans } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Input,
  InputAdornment,
  Tab,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useMemo, useState } from "react";

import { DataSource } from "@/configurator";
import { DataSetMetadata } from "@/configurator/components/dataset-metadata";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { Icon, getDimensionIconName } from "@/icons";
import SvgIcClose from "@/icons/components/IcClose";
import useEvent from "@/utils/use-event";

import Flex from "./flex";

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

const useDrawerStyles = makeStyles<Theme, { top: number }>((theme) => {
  return {
    root: {
      position: "static",

      "& > .MuiPaper-root": {
        top: ({ top }) => top,
        bottom: 0,
        width: DRAWER_WIDTH + 1,
        height: "auto",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        borderRight: `1px ${theme.palette.divider} solid`,
        boxShadow: "none",
      },
    },
  };
});

const useOtherStyles = makeStyles<Theme>((theme) => {
  return {
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
    tabPanel: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(4),
      padding: 0,
    },
    icon: {
      display: "inline",
      marginLeft: -6,
      marginTop: -3,
      marginRight: 2,
    },
    search: {
      marginTop: theme.spacing(2),
      padding: "0px 12px",
      width: "100%",
      height: 40,
      minHeight: 40,
    },
  };
});

export const MetadataPanel = ({
  datasetIri,
  dataSource,
  dimensions,
  container,
  top,
}: {
  datasetIri: string;
  dataSource: DataSource;
  dimensions: DimensionMetadataFragment[];
  container?: HTMLDivElement | null;
  top?: number;
}) => {
  return (
    <ContextProvider>
      <PanelInner
        datasetIri={datasetIri}
        dataSource={dataSource}
        dimensions={dimensions}
        container={container}
        top={top}
      />
    </ContextProvider>
  );
};

const PanelInner = ({
  datasetIri,
  dataSource,
  dimensions,
  container,
  top = 0,
}: {
  datasetIri: string;
  dataSource: DataSource;
  dimensions: DimensionMetadataFragment[];
  container: HTMLDivElement | null | undefined;
  top?: number;
}) => {
  const drawerClasses = useDrawerStyles({ top });
  const otherClasses = useOtherStyles();
  const { open, toggle, activeSection, setActiveSection } = useContext();
  const handleToggle = useEvent(() => {
    toggle();
  });

  return (
    <>
      <ToggleButton onClick={handleToggle} />

      <Drawer
        className={drawerClasses.root}
        open={open}
        anchor="left"
        hideBackdrop
        ModalProps={{ container }}
        PaperProps={{ style: { position: "absolute" } }}
      >
        <Header onClose={handleToggle} />

        <TabContext value={activeSection}>
          <TabList
            className={otherClasses.tabList}
            onChange={(_, v) => {
              setActiveSection(v);
            }}
          >
            <Tab
              value="general"
              label={
                <Typography variant="body2" fontWeight="bold">
                  <Trans id="controls.metadata-panel.section.general">
                    General
                  </Trans>
                </Typography>
              }
            />
            <Tab
              value="data"
              label={
                <Typography variant="body2" fontWeight="bold">
                  <Trans id="controls.metadata-panel.section.data">Data</Trans>
                </Typography>
              }
            />
          </TabList>

          <TabPanelGeneral datasetIri={datasetIri} dataSource={dataSource} />
          <TabPanelData dimensions={dimensions} />
        </TabContext>

        <Content />
      </Drawer>
    </>
  );
};

const ToggleButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button component="a" variant="text" size="small" onClick={onClick}>
      <Typography variant="body2">
        <Trans id="controls.metadata-panel.metadata">Metadata</Trans>
      </Typography>
    </Button>
  );
};

const Header = ({ onClose }: { onClose: () => void }) => {
  const classes = useOtherStyles();

  return (
    <div className={classes.header}>
      <Typography variant="body2" fontWeight="bold">
        <Trans id="controls.metadata-panel.metadata">Metadata</Trans>
      </Typography>

      <IconButton size="small" onClick={onClose}>
        <SvgIcClose />
      </IconButton>
    </div>
  );
};

const Content = () => {
  const classes = useOtherStyles();

  return <div className={classes.content}></div>;
};

const TabPanelGeneral = ({
  datasetIri,
  dataSource,
}: {
  datasetIri: string;
  dataSource: DataSource;
}) => {
  const classes = useOtherStyles();

  return (
    <TabPanel className={classes.tabPanel} value="general">
      <DataSetMetadata dataSetIri={datasetIri} dataSource={dataSource} />
    </TabPanel>
  );
};

const TabPanelData = ({
  dimensions,
}: {
  dimensions: DimensionMetadataFragment[];
}) => {
  const classes = useOtherStyles();
  const [searchInput, setSearchInput] = useState("");

  const filteredDimensions = useMemo(() => {
    return dimensions.filter(
      (d) =>
        d.label.toLowerCase().includes(searchInput) ||
        d.description?.toLowerCase().includes(searchInput)
    );
  }, [dimensions, searchInput]);

  return (
    <TabPanel className={classes.tabPanel} value="data">
      {/* Extract into a component (as it's also used in MultiFilter drawer?) */}
      <Input
        className={classes.search}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
        placeholder={t({
          id: "select.controls.metadata.search",
          message: "Jump to...",
        })}
        startAdornment={
          <InputAdornment position="start">
            <Icon name="search" size={16} />
          </InputAdornment>
        }
        sx={{ typography: "body2" }}
      />
      {filteredDimensions.map((d) => (
        <Box key={d.iri}>
          <Flex>
            <Icon
              className={classes.icon}
              name={getDimensionIconName(d.__typename)}
            />
            <Typography variant="body2" fontWeight="bold">
              {d.label}
            </Typography>
          </Flex>
          <Typography variant="body2">{d.description}</Typography>
        </Box>
      ))}
    </TabPanel>
  );
};
