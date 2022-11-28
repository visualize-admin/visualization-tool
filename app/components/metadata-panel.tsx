import { t, Trans } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  Tab,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import clsx from "clsx";
import { AnimatePresence, Transition } from "framer-motion";
import React, { useState } from "react";

import { BackButton, DataSource } from "@/configurator";
import { DataSetMetadata } from "@/configurator/components/dataset-metadata";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import { MotionBox } from "@/configurator/components/presence";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getDimensionIconName, Icon } from "@/icons";
import SvgIcArrowRight from "@/icons/components/IcArrowRight";
import SvgIcClose from "@/icons/components/IcClose";
import useEvent from "@/utils/use-event";

import Flex from "./flex";

type Section = "general" | "data";

type State = {
  open: boolean;
  toggle: () => void;
  activeSection: Section;
  setActiveSection: (d: Section) => void;
  selectedDimension: DimensionMetadataFragment | undefined;
  setSelectedDimension: (d: DimensionMetadataFragment | undefined) => void;
  clearSelectedDimension: () => void;
};

const Context = React.createContext<State | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<Section>("general");
  const [selectedDimension, setSelectedDimension] = React.useState<
    DimensionMetadataFragment | undefined
  >(undefined);

  const ctx: State = React.useMemo(() => {
    return {
      open,
      toggle: () => setOpen(!open),
      activeSection,
      setActiveSection,
      selectedDimension,
      setSelectedDimension,
      clearSelectedDimension: () => setSelectedDimension(undefined),
    };
  }, [open, activeSection, selectedDimension]);

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
      padding: 0,
    },
    tabPanelContent: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(4),
    },
    icon: {
      display: "inline",
      marginLeft: -2,
      marginTop: -3,
      marginRight: 2,
    },
    search: {
      "& .MuiAutocomplete-inputRoot": {
        padding: `0px ${theme.spacing(3)}`,

        "& > .MuiAutocomplete-input": {
          padding: `${theme.spacing(2)} 0px`,
        },
      },
    },
    searchInputResultList: {
      marginTop: theme.spacing(1),
      padding: 0,
      border: `1px solid ${theme.palette.grey[700]}`,
      borderRadius: 3,
    },
    searchInputResult: {
      borderBottom: `1px solid ${theme.palette.grey[400]}`,

      "&:last-of-type": {
        borderBottom: "none",
      },
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

const animationProps: Transition = {
  transition: {
    duration: 0.2,
  },
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
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

          <AnimatePresence>
            {activeSection === "general" ? (
              <MotionBox key="general-tab" {...animationProps}>
                <TabPanelGeneral
                  datasetIri={datasetIri}
                  dataSource={dataSource}
                />
              </MotionBox>
            ) : activeSection === "data" ? (
              <MotionBox key="data-tab" {...animationProps}>
                <TabPanelData dimensions={dimensions} />
              </MotionBox>
            ) : null}
          </AnimatePresence>
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
  const { selectedDimension, setSelectedDimension, clearSelectedDimension } =
    useContext();
  const [inputValue, setInputValue] = useState("");

  const options = React.useMemo(() => {
    return dimensions.map((d) => ({ label: d.label, value: d }));
  }, [dimensions]);

  return (
    <TabPanel className={classes.tabPanel} value="data">
      <AnimatePresence exitBeforeEnter={true}>
        {selectedDimension ? (
          <MotionBox key="dimension-selected" {...animationProps}>
            <BackButton onClick={() => clearSelectedDimension()}>
              <Trans id="button.back">Back</Trans>
            </BackButton>
            <Box sx={{ mt: 4 }}>
              <TabPanelDataDimension
                dim={selectedDimension}
                expandable={false}
              />
            </Box>
          </MotionBox>
        ) : (
          <MotionBox
            key="dimension-not-selected"
            className={classes.tabPanelContent}
            {...animationProps}
          >
            <Autocomplete
              className={classes.search}
              disablePortal
              onChange={(_, v) => setSelectedDimension(v?.value)}
              inputValue={inputValue}
              onInputChange={(_, v) => setInputValue(v.toLowerCase())}
              options={options}
              ListboxProps={{ className: classes.searchInputResultList }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className={classes.search}
                  placeholder={t({
                    id: "select.controls.metadata.search",
                    message: "Jump to...",
                  })}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="search" size={16} />
                      </InputAdornment>
                    ),
                    sx: { typography: "body2" },
                  }}
                />
              )}
              renderOption={(props, option, { inputValue }) => {
                const matches = match(option.label, inputValue, {
                  insideWords: true,
                });
                const parts = parse(option.label, matches);

                return (
                  <li
                    {...props}
                    className={clsx(props.className, classes.searchInputResult)}
                  >
                    <div>
                      {parts.map(({ text, highlight }, i) => (
                        <Typography
                          key={i}
                          variant="body2"
                          component="span"
                          style={{ fontWeight: highlight ? 700 : 400 }}
                        >
                          {text}
                        </Typography>
                      ))}
                    </div>
                  </li>
                );
              }}
              clearIcon={null}
            />
            {dimensions.map((d) => (
              <TabPanelDataDimension key={d.iri} dim={d} expandable={true} />
            ))}
          </MotionBox>
        )}
      </AnimatePresence>
    </TabPanel>
  );
};

const TabPanelDataDimension = ({
  dim,
  expandable,
}: {
  dim: DimensionMetadataFragment;
  expandable: boolean;
}) => {
  const classes = useOtherStyles();
  const { setSelectedDimension } = useContext();
  const { description, showExpandButton } = React.useMemo(() => {
    if (expandable && dim.description && dim.description.length > 180) {
      return {
        description: dim.description.slice(0, 180) + "…",
        showExpandButton: true,
      };
    }

    return {
      description: dim.description,
      showExpandButton: false,
    };
  }, [dim.description, expandable]);
  const iconName = React.useMemo(() => {
    return getDimensionIconName(dim.__typename);
  }, [dim.__typename]);

  return (
    <div>
      <Flex>
        <Icon className={classes.icon} name={iconName} />
        <Typography variant="body2" fontWeight="bold">
          {dim.label}
        </Typography>
      </Flex>
      {description && <Typography variant="body2">{description}</Typography>}
      {showExpandButton && (
        <Button
          component="a"
          variant="text"
          size="small"
          onClick={() => setSelectedDimension(dim)}
          endIcon={<SvgIcArrowRight />}
          sx={{ p: 0 }}
        >
          Show more
        </Button>
      )}
    </div>
  );
};
