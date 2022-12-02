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
import { useRouter } from "next/router";
import React from "react";
import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";

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

type MetadataPanelSection = "general" | "data";

type MetadataPanelState = {
  open: boolean;
  activeSection: MetadataPanelSection;
  selectedDimension: DimensionMetadataFragment | undefined;
  actions: {
    setOpen: (d: boolean) => void;
    toggle: () => void;
    setActiveSection: (d: MetadataPanelSection) => void;
    setSelectedDimension: (d: DimensionMetadataFragment) => void;
    clearSelectedDimension: () => void;
    openDimension: (d: DimensionMetadataFragment) => void;
    reset: () => void;
  };
};

export const createMetadataPanelStore = () =>
  createStore<MetadataPanelState>((set, get) => ({
    open: false,
    activeSection: "general",
    selectedDimension: undefined,
    actions: {
      setOpen: (d: boolean) => {
        set({ open: d });
      },
      toggle: () => {
        set({ open: !get().open });
      },
      setActiveSection: (d: MetadataPanelSection) => {
        set({ activeSection: d });
      },
      setSelectedDimension: (d: DimensionMetadataFragment) => {
        set({ selectedDimension: d });
      },
      clearSelectedDimension: () => {
        set({ selectedDimension: undefined });
      },
      openDimension: (d: DimensionMetadataFragment) => {
        set({ open: true, activeSection: "data", selectedDimension: d });
      },
      reset: () => {
        set({ activeSection: "general", selectedDimension: undefined });
      },
    },
  }));

const useMetadataPanelStore: <T>(
  selector: (state: MetadataPanelState) => T
) => T = (selector) => {
  const store = React.useContext(MetadataPanelStoreContext);

  return useStore(store, selector, shallow);
};

const useMetadataPanelStoreActions = () => {
  const store = React.useContext(MetadataPanelStoreContext);

  return useStore(store, (state) => state.actions);
};

const defaultStore = createMetadataPanelStore();

export const MetadataPanelStoreContext = React.createContext(defaultStore);

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
      paddingBottom: theme.spacing(3),
    },
    tabPanelContent: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(4),
    },
    dimensionButton: {
      textAlign: "left",
      minHeight: 0,
      padding: 0,
      color: theme.palette.grey[700],

      "& > svg": {
        marginLeft: 0,
      },
    },
    dimensionValues: {
      flexDirection: "column",
      gap: theme.spacing(2),
      marginTop: theme.spacing(3),
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
    openDimension: {
      minHeight: 0,
      verticalAlign: "baseline",
      padding: 0,
      margin: 0,
      fontSize: "inherit",
      color: "inherit",
    },
    openDimensionSVG: {
      cursor: "pointer",

      "&:hover": {
        fill: theme.palette.primary.hover,
      },
    },
  };
});

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

export const OpenMetadataPanelWrapper = ({
  dim,
  svg,
  children,
}: {
  dim: DimensionMetadataFragment;
  svg?: boolean;
  children: React.ReactNode;
}) => {
  const classes = useOtherStyles();
  const { openDimension } = useMetadataPanelStoreActions();
  const handleClick = useEvent(() => {
    openDimension(dim);
  });

  return svg ? (
    <g className={classes.openDimensionSVG} onClick={handleClick}>
      {children}
    </g>
  ) : (
    <Button
      className={classes.openDimension}
      variant="text"
      size="small"
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export const MetadataPanel = ({
  datasetIri,
  dataSource,
  dimensions,
  container,
  top = 0,
}: {
  datasetIri: string;
  dataSource: DataSource;
  dimensions: DimensionMetadataFragment[];
  container?: HTMLDivElement | null;
  top?: number;
}) => {
  const router = useRouter();
  const drawerClasses = useDrawerStyles({ top });
  const otherClasses = useOtherStyles();
  const { open, activeSection } = useMetadataPanelStore((state) => ({
    open: state.open,
    activeSection: state.activeSection,
  }));
  const { setOpen, toggle, setActiveSection, reset } =
    useMetadataPanelStoreActions();
  const handleToggle = useEvent(() => {
    toggle();
  });

  // Close and reset the metadata panel when route has changed.
  React.useEffect(() => {
    setOpen(false);
    reset();
  }, [router.pathname, setOpen, reset]);

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
  const selectedDimension = useMetadataPanelStore(
    (state) => state.selectedDimension
  );
  const { setSelectedDimension, clearSelectedDimension } =
    useMetadataPanelStoreActions();
  const [inputValue, setInputValue] = React.useState("");

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
              <TabPanelDataDimension dim={selectedDimension} expanded={true} />
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
              onChange={(_, v) => v && setSelectedDimension(v.value)}
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
              <TabPanelDataDimension key={d.iri} dim={d} expanded={false} />
            ))}
          </MotionBox>
        )}
      </AnimatePresence>
    </TabPanel>
  );
};

const TabPanelDataDimension = ({
  dim,
  expanded,
}: {
  dim: DimensionMetadataFragment;
  expanded: boolean;
}) => {
  const classes = useOtherStyles();
  const { setSelectedDimension } = useMetadataPanelStoreActions();
  const { description, showExpandButton } = React.useMemo(() => {
    if (!expanded && dim.description && dim.description.length > 180) {
      return {
        description: dim.description.slice(0, 180) + "…",
        showExpandButton: true,
      };
    }

    return {
      description: dim.description,
      showExpandButton: false,
    };
  }, [dim.description, expanded]);
  const iconName = React.useMemo(() => {
    return getDimensionIconName(dim.__typename);
  }, [dim.__typename]);

  const handleClick = React.useCallback(() => {
    if (!expanded) {
      setSelectedDimension(dim);
    }
  }, [expanded, dim, setSelectedDimension]);

  return (
    <div>
      <Flex sx={{ justifyContent: "space-between" }}>
        <div>
          <Button
            className={classes.dimensionButton}
            variant="text"
            size="small"
            onClick={handleClick}
            sx={{
              ":hover": { color: !expanded ? "primary.main" : "grey.800" },
              cursor: !expanded ? "pointer" : "default",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {dim.label}
            </Typography>
          </Button>
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>
        <Icon name={iconName} />
      </Flex>

      <AnimatePresence>
        {expanded && (
          <MotionBox
            key="dimension-values"
            className={classes.dimensionValues}
            component={Flex}
            {...animationProps}
          >
            {dim.values.map((d) => (
              <React.Fragment key={d.value}>
                <Typography variant="body2" {...animationProps}>
                  {d.label}{" "}
                  {d.alternateName ? (
                    <span style={{ fontStyle: "italic" }}>
                      ({d.alternateName})
                    </span>
                  ) : (
                    ""
                  )}
                </Typography>
                {d.description ? (
                  <Typography variant="caption">{d.description}</Typography>
                ) : null}
              </React.Fragment>
            ))}
          </MotionBox>
        )}
      </AnimatePresence>

      {showExpandButton && (
        <Button
          component="a"
          variant="text"
          size="small"
          onClick={handleClick}
          endIcon={<SvgIcArrowRight />}
          sx={{ p: 0 }}
        >
          Show more
        </Button>
      )}
    </div>
  );
};
