import { t, Trans } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
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
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";

import { DatasetMetadata } from "@/components/dataset-metadata";
import { Error, Loading } from "@/components/hint";
import { MotionBox } from "@/components/presence";
import { BackButton, ChartConfig, DataSource } from "@/configurator";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import { getDimensionLabel } from "@/configurator/components/ui-helpers";
import {
  Component,
  DimensionValue,
  isStandardErrorDimension,
  TemporalDimension,
} from "@/domain/data";
import { useDimensionFormatters } from "@/formatters";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { Icon } from "@/icons";
import SvgIcArrowRight from "@/icons/components/IcArrowRight";
import SvgIcClose from "@/icons/components/IcClose";
import { useLocale } from "@/locales/use-locale";
import { useTransitionStore } from "@/stores/transition";
import { useEmbedOptions } from "@/utils/embed";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

import Flex from "./flex";

type MetadataPanelSection = "general" | "data";

type MetadataPanelState = {
  open: boolean;
  activeSection: MetadataPanelSection;
  selectedDimension: Component | undefined;
  actions: {
    setOpen: (d: boolean) => void;
    toggle: () => void;
    setActiveSection: (d: MetadataPanelSection) => void;
    setSelectedDimension: (d: Component) => void;
    clearSelectedDimension: () => void;
    openDimension: (d: Component) => void;
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
      setSelectedDimension: (d: Component) => {
        set({ selectedDimension: d });
      },
      clearSelectedDimension: () => {
        set({ selectedDimension: undefined });
      },
      openDimension: (d: Component) => {
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

export const useMetadataPanelStoreActions = () => {
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
        top: ({ top }: { top: number }) => top,
        bottom: 0,
        width: DRAWER_WIDTH,
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
    toggleButton: {
      alignSelf: "flex-start",
    },
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

        "&:not(.Mui-selected)": {
          color: theme.palette.grey[600],
        },
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
      textDecoration: "underline",
      textUnderlineOffset: "2px",
      textAlign: "left",
      transition: "opacity 0.2s ease-in-out",

      "&:hover": {
        textDecoration: "underline",
        color: "inherit",
        opacity: 0.9,
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
  children,
}: React.PropsWithChildren<{ dim: Component }>) => {
  const classes = useOtherStyles();
  const { openDimension } = useMetadataPanelStoreActions();
  const handleClick = useEvent((e: React.MouseEvent) => {
    e.stopPropagation();
    openDimension(dim);
  });

  const [embedOptions] = useEmbedOptions();
  if (embedOptions.showMetadata === false) {
    return <>{children}</>;
  }

  return (
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

type MetadataPanelProps = {
  chartConfigs: ChartConfig[];
  dataSource: DataSource;
  dimensions: Component[];
  container?: HTMLDivElement | null;
  top?: number;
};

export const MetadataPanel = (props: MetadataPanelProps) => {
  const { dimensions, container, top = 0, chartConfigs, dataSource } = props;
  const router = useRouter();
  const drawerClasses = useDrawerStyles({ top });
  const otherClasses = useOtherStyles();
  const { open, activeSection } = useMetadataPanelStore((state) => ({
    open: state.open,
    activeSection: state.activeSection,
  }));
  const setEnableTransition = useTransitionStore((state) => state.setEnable);
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

  const [embedOptions] = useEmbedOptions();

  if (embedOptions.showMetadata === false) {
    return null;
  }

  return (
    <>
      <ToggleButton onClick={handleToggle} />

      <Drawer
        data-testid="panel-metadata"
        className={drawerClasses.root}
        open={open}
        anchor="left"
        hideBackdrop
        disableEnforceFocus
        ModalProps={{ container }}
        PaperProps={{ style: { position: "absolute" } }}
        SlideProps={{
          onEnter: () => setEnableTransition(false),
          onEntered: () => setEnableTransition(true),
          onExit: () => setEnableTransition(false),
          onExited: () => setEnableTransition(true),
        }}
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
                  dataSource={dataSource}
                  chartConfigs={chartConfigs}
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
  const classes = useOtherStyles();

  return (
    <Button
      data-testid="panel-metadata-toggle"
      className={classes.toggleButton}
      variant="contained"
      color="secondary"
      size="small"
      onClick={onClick}
    >
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
  dataSource,
  chartConfigs,
}: {
  dataSource: DataSource;
  chartConfigs: ChartConfig[];
}) => {
  const classes = useOtherStyles();
  const locale = useLocale();

  const cubes = uniqBy(
    chartConfigs.flatMap((x) => x.cubes).map((x) => ({ iri: x.iri })),
    (x) => x.iri
  );

  const [{ data, fetching, error }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: cubes,
    },
  });
  const cubesMetadata = data?.dataCubesMetadata;
  if (!cubesMetadata) {
    return null;
  }
  return (
    <TabPanel className={classes.tabPanel} value="general">
      {fetching ? <Loading /> : null}
      {error ? (
        <Error>{`${error instanceof Error ? error.message : error}`}</Error>
      ) : null}
      <Stack divider={<Divider />} gap="1.5rem">
        {cubesMetadata?.map((cube) => (
          <DatasetMetadata
            key={cube.iri}
            cube={cube}
            showTitle={cubes.length > 1}
          />
        ))}
      </Stack>
    </TabPanel>
  );
};

const TabPanelData = ({ dimensions }: { dimensions: Component[] }) => {
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
      <AnimatePresence mode="wait">
        {selectedDimension ? (
          <MotionBox key="dimension-selected" {...animationProps}>
            <BackButton
              onClick={() => clearSelectedDimension()}
              sx={{ color: "primary.main" }}
            >
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
                const parts = parse(getDimensionLabel(option.value), matches);

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
  dim: Component;
  expanded: boolean;
}) => {
  const classes = useOtherStyles();
  const { setSelectedDimension } = useMetadataPanelStoreActions();
  const description = React.useMemo(() => {
    if (!expanded && dim.description && dim.description.length > 180) {
      return `${dim.description.slice(0, 180)}…`;
    }

    return dim.description;
  }, [dim.description, expanded]);

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
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {getDimensionLabel(dim)}
            </Typography>
          </Button>
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>
      </Flex>

      <AnimatePresence>
        {expanded && (
          <MotionBox
            key="dimension-values"
            className={classes.dimensionValues}
            component={Flex}
            {...animationProps}
          >
            <Typography
              sx={{ mt: 2, color: "grey.800" }}
              variant="body2"
              fontWeight="bold"
              gutterBottom
            >
              <Trans id="controls.metadata-panel.available-values">
                Available values
              </Trans>
            </Typography>
            <DimensionValues dim={dim} />
          </MotionBox>
        )}
      </AnimatePresence>

      {!expanded && (
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

const DimensionValues = ({ dim }: { dim: Component }) => {
  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(dim);
    return orderBy(
      dim.values,
      sorters.map((s) => (dv) => s(dv.label))
    ) as DimensionValue[];
  }, [dim]);

  if (isStandardErrorDimension(dim)) {
    return <DimensionValuesNumeric values={sortedValues} />;
  }

  switch (dim.__typename) {
    case "NominalDimension":
    case "OrdinalDimension":
    case "TemporalOrdinalDimension":
    case "OrdinalMeasure":
    case "GeoCoordinatesDimension":
    case "GeoShapesDimension":
      return <DimensionValuesNominal values={sortedValues} />;
    case "NumericalMeasure":
      return sortedValues.length > 0 ? (
        <DimensionValuesNumeric values={sortedValues} />
      ) : null;
    case "TemporalDimension":
      return <DimensionValuesTemporal dim={dim} values={sortedValues} />;
    default:
      const _exhaustiveCheck: never = dim;
      return _exhaustiveCheck;
  }
};

const DimensionValuesNominal = ({ values }: { values: DimensionValue[] }) => {
  return (
    <>
      {values.map((d) =>
        d.label ? (
          <React.Fragment key={d.value}>
            <Typography variant="body2" fontWeight="bold" {...animationProps}>
              {d.label}{" "}
              {d.alternateName ? (
                <span style={{ fontStyle: "italic" }}>({d.alternateName})</span>
              ) : (
                ""
              )}
            </Typography>
            {d.description ? (
              <Typography variant="body2">{d.description}</Typography>
            ) : null}
          </React.Fragment>
        ) : null
      )}
    </>
  );
};

const DimensionValuesNumeric = ({ values }: { values: DimensionValue[] }) => {
  const [min, max] = [values[0].value, values[values.length - 1].value];

  return (
    <>
      <Typography variant="body2">Min: {min}</Typography>
      <Typography variant="body2">Max: {max}</Typography>
    </>
  );
};

const DimensionValuesTemporal = ({
  dim,
  values,
}: {
  dim: TemporalDimension;
  values: DimensionValue[];
}) => {
  const formatters = useDimensionFormatters([dim]);
  const format = formatters[dim.iri];
  const [min, max] = [values[0].value, values[values.length - 1].value];

  return (
    <>
      <Typography variant="body2">Min: {format(min)}</Typography>
      <Typography variant="body2">Max: {format(max)}</Typography>
    </>
  );
};
