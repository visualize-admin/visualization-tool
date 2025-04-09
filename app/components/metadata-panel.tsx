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
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";
import { useRouter } from "next/router";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  extractChartConfigComponentIds,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { DatasetMetadata } from "@/components/dataset-metadata";
import { useEmbedQueryParams } from "@/components/embed-params";
import Flex from "@/components/flex";
import { Error, Loading } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { JoinByChip } from "@/components/JoinByChip";
import {
  useMetadataPanelStore,
  useMetadataPanelStoreActions,
} from "@/components/metadata-panel-store";
import { MotionBox } from "@/components/presence";
import {
  BackButton,
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
} from "@/configurator";
import { DRAWER_WIDTH } from "@/configurator/components/drawers";
import {
  getComponentDescription,
  getComponentLabel,
} from "@/configurator/components/ui-helpers";
import {
  Component,
  DimensionValue,
  isConfidenceLowerBoundDimension,
  isConfidenceUpperBoundDimension,
  isJoinByComponent,
  isStandardErrorDimension,
  TemporalDimension,
} from "@/domain/data";
import { useDimensionFormatters } from "@/formatters";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { Icon } from "@/icons";
import SvgIcArrowRight from "@/icons/components/IcArrowRight";
import SvgIcClose from "@/icons/components/IcClose";
import { useLocale } from "@/locales/use-locale";
import { useTransitionStore } from "@/stores/transition";
import { assert } from "@/utils/assert";
import { useEventEmitter } from "@/utils/eventEmitter";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

const useDrawerStyles = makeStyles<Theme, { top: number | string }>((theme) => {
  return {
    root: {
      position: "static",

      "& > .MuiPaper-root": {
        top: ({ top }) => top,
        bottom: 0,
        width: "100%",
        maxWidth: DRAWER_WIDTH + 1,
        height: "auto",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      },
    },
  };
});

const useOtherStyles = makeStyles<Theme>((theme) => {
  return {
    toggleButton: {
      minHeight: 0,
      padding: 0,
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
      marginBottom: "0.25rem",
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
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.grey[400]}`,

      "&:last-of-type": {
        borderBottom: "none",
      },
    },
    openComponentInteractive: {
      minHeight: 0,
      verticalAlign: "baseline",
      padding: 0,
      margin: 0,
      fontSize: "inherit",
      color: theme.palette.primary.main,
      textAlign: "left",
      transition: "opacity 0.2s ease-in-out",
    },
    openComponentNonInteractive: {
      position: "relative",
      display: "inline-flex",
      width: "fit-content",
      fontSize: "inherit",
      textAlign: "left",
      lineHeight: 1.25,
      color: theme.palette.grey[800],
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
  children,
  component,
}: {
  children: ReactNode;
  component?: Component;
}) => {
  const { embedParams } = useEmbedQueryParams();
  const classes = useOtherStyles();
  const { openComponent, setOpen, setActiveSection } =
    useMetadataPanelStoreActions();
  const handleClick = useEvent((e: React.MouseEvent) => {
    e.stopPropagation();
    if (component) {
      openComponent(component);
    } else {
      setActiveSection("general");
      setOpen(true);
    }
  });

  return embedParams.removeLabelsInteractivity ? (
    <div className={classes.openComponentNonInteractive}>{children}</div>
  ) : (
    <Button
      className={classes.openComponentInteractive}
      variant="text"
      size="sm"
      color="blue"
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export const MetadataPanel = ({
  chartConfig,
  dashboardFilters,
  dataSource,
  components,
  container,
  top = 0,
  allowMultipleOpen,
  renderToggle = true,
  smallerToggle,
}: {
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  dataSource: DataSource;
  components: Component[];
  container?: HTMLDivElement | null;
  top?: number | string;
  allowMultipleOpen?: boolean;
  renderToggle?: boolean;
  smallerToggle?: boolean;
}) => {
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
  const ee = useEventEmitter("metadata-panel-opened", () => {
    if (open) {
      setOpen(false);
    }
  });
  const handleToggle = useEvent(() => {
    toggle();
    if (!allowMultipleOpen) {
      ee.emit("metadata-panel-opened", { datasetIri: "" });
    }
  });

  // Close and reset the metadata panel when route has changed.
  useEffect(() => {
    const handleHashChange = () => {
      setOpen(false);
      reset();
    };
    router.events.on("hashChangeStart", handleHashChange);
    return () => {
      router.events.off("hashChangeStart", handleHashChange);
    };
  }, [setOpen, reset, router.events]);

  return (
    <>
      {renderToggle && (
        <ToggleButton smaller={smallerToggle} onClick={handleToggle} />
      )}
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
              <MotionBox key="cubes-panel" {...animationProps}>
                <CubesPanel
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  dashboardFilters={dashboardFilters}
                />
              </MotionBox>
            ) : activeSection === "data" ? (
              <MotionBox key="data-panel" {...animationProps}>
                <DataPanel dataSource={dataSource} components={components} />
              </MotionBox>
            ) : null}
          </AnimatePresence>
        </TabContext>
      </Drawer>
    </>
  );
};

const ToggleButton = ({
  smaller,
  onClick,
}: {
  smaller?: boolean;
  onClick: () => void;
}) => {
  const classes = useOtherStyles();

  return (
    <Button
      data-testid="panel-metadata-toggle"
      className={classes.toggleButton}
      variant="text"
      color="blue"
      size={smaller ? "xs" : "sm"}
      onClick={onClick}
    >
      <Trans id="controls.metadata-panel.metadata">Details</Trans>
    </Button>
  );
};

const Header = ({ onClose }: { onClose: () => void }) => {
  const classes = useOtherStyles();

  return (
    <div className={classes.header}>
      <Typography variant="h6" component="p" sx={{ fontWeight: "bold" }}>
        <Trans id="controls.metadata-panel.metadata">Details</Trans>
      </Typography>
      <IconButton size="small" onClick={onClose}>
        <SvgIcClose />
      </IconButton>
    </div>
  );
};

const CubesPanel = ({
  dataSource,
  chartConfig,
  dashboardFilters,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
}) => {
  const classes = useOtherStyles();
  const locale = useLocale();
  const cubes = chartConfig.cubes.map((cube) => ({ iri: cube.iri }));
  const [
    {
      data: dataCubesMetadataData,
      fetching: fetchingDataCubesMetadata,
      error: dataCubesMetadataError,
    },
  ] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: cubes,
    },
  });
  const cubesMetadata = dataCubesMetadataData?.dataCubesMetadata;
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    componentIds: extractChartConfigComponentIds({ chartConfig }),
  });
  const [
    { data: dataCubesObservationsData, error: dataCubesObservationsError },
  ] = useDataCubesObservationsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: queryFilters,
    },
  });
  const cubesObservations = dataCubesObservationsData?.dataCubesObservations;

  const error = dataCubesMetadataError || dataCubesObservationsError;

  return (
    <TabPanel className={classes.tabPanel} value="general">
      {fetchingDataCubesMetadata ? <Loading /> : null}
      {error ? (
        <Error>{`${error instanceof Error ? error.message : error}`}</Error>
      ) : null}
      <Stack divider={<Divider />} gap="1.5rem">
        {cubesMetadata?.map((cube) => {
          const sparqlEditorUrl = cubesObservations?.sparqlEditorUrls?.find(
            (x) => x.cubeIri === cube.iri
          )?.url;
          const cubeQueryFilters = queryFilters.find((f) => f.iri === cube.iri);
          assert(cubeQueryFilters, "Cube query filters not found");
          return (
            <DatasetMetadata
              key={cube.iri}
              cube={cube}
              showTitle
              sparqlEditorUrl={sparqlEditorUrl}
              dataSource={dataSource}
              queryFilters={cubeQueryFilters}
            />
          );
        })}
      </Stack>
    </TabPanel>
  );
};

const DataPanel = ({
  dataSource,
  components,
}: {
  dataSource: DataSource;
  components: Component[];
}) => {
  const locale = useLocale();
  const classes = useOtherStyles();
  const selectedDimension = useMetadataPanelStore(
    (state) => state.selectedComponent
  );
  const { setSelectedComponent, clearSelectedComponent } =
    useMetadataPanelStoreActions();
  const [inputValue, setInputValue] = useState("");
  const { options, groupedComponents } = useMemo(() => {
    const options = components.flatMap(
      (
        component
      ): {
        label: string;
        value: Component;
        isJoinByDimension: boolean;
      }[] => {
        if (isJoinByComponent(component)) {
          return (component.originalIds ?? []).map((x) => ({
            label: getComponentLabel(component, { cubeIri: x.cubeIri }),
            value: {
              ...omit(component, "originalIds"),
              cubeIri: x.cubeIri,
              id: x.dimensionId,
            } as unknown as Component,
            isJoinByDimension: true,
          }));
        } else {
          return [
            {
              label: component.label,
              value: component,
              isJoinByDimension: false,
            },
          ];
        }
      }
    );
    const groupedComponents = groupBy(
      components.flatMap((component): Component[] => {
        if ("originalIds" in component && component.originalIds) {
          return (
            component.originalIds.map((originalId) => ({
              ...component,
              cubeIri: originalId.cubeIri,
              id: originalId.dimensionId,
            })) ?? []
          );
        } else {
          return [component];
        }
      }),
      (x) => x.cubeIri
    );

    return { options, groupedComponents };
  }, [components]);
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      locale: locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters: Object.keys(groupedComponents).map((iri) => ({ iri })),
    },
    keepPreviousData: true,
  });
  const dataCubesMetadata = metadataQuery.data?.dataCubesMetadata;
  const cubesByIri = useMemo(
    () => keyBy(dataCubesMetadata, (x) => x.iri),
    [dataCubesMetadata]
  );
  const sortedOptions = useMemo(
    () => sortBy(options, (x) => cubesByIri[x.value.cubeIri]?.title),
    [options, cubesByIri]
  );

  return (
    <TabPanel className={classes.tabPanel} value="data">
      <AnimatePresence mode="wait">
        {selectedDimension ? (
          <MotionBox key="dimension-selected" {...animationProps}>
            <BackButton
              onClick={() => clearSelectedComponent()}
              sx={{ color: "primary.main" }}
            >
              <Trans id="button.back">Back</Trans>
            </BackButton>
            <Box sx={{ mt: 4 }}>
              <ComponentTabPanel
                component={selectedDimension}
                expanded
                dataSource={dataSource}
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
              onChange={(_, v) => v && setSelectedComponent(v.value)}
              inputValue={inputValue}
              onInputChange={(_, v) => setInputValue(v.toLowerCase())}
              options={sortedOptions}
              groupBy={(x) => cubesByIri[x.value.cubeIri]?.title ?? ""}
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
                    {parts.map(({ text, highlight }, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        component="span"
                        flexGrow={1}
                        style={{ fontWeight: highlight ? 700 : 400 }}
                      >
                        {text}
                      </Typography>
                    ))}
                    {option.isJoinByDimension ? (
                      <JoinByChip
                        label={<Trans id="dimension.joined">Joined</Trans>}
                      />
                    ) : (
                      ""
                    )}
                  </li>
                );
              }}
              clearIcon={null}
            />
            <Stack spacing={4} divider={<Divider />}>
              {Object.entries(groupedComponents).map(
                ([cubeIri, components]) => {
                  const cube = cubesByIri[cubeIri];
                  if (!cube) {
                    return null;
                  }

                  return (
                    <div key={cubeIri}>
                      {dataCubesMetadata && dataCubesMetadata.length > 1 ? (
                        <Typography
                          variant="h4"
                          sx={{ mb: 2 }}
                          color="grey.700"
                        >
                          {cube.title}
                        </Typography>
                      ) : null}
                      <Stack spacing={2}>
                        {components.map((component) => (
                          <ComponentTabPanel
                            key={component.id}
                            component={component}
                            cubeIri={cubeIri}
                            expanded={false}
                            dataSource={dataSource}
                          />
                        ))}
                      </Stack>
                    </div>
                  );
                }
              )}
            </Stack>
          </MotionBox>
        )}
      </AnimatePresence>
    </TabPanel>
  );
};

const ComponentTabPanel = ({
  component,
  dataSource,
  expanded,
  cubeIri,
}: {
  component: Component;
  dataSource: DataSource;
  expanded: boolean;
  cubeIri?: string;
}) => {
  const classes = useOtherStyles();
  const { setSelectedComponent } = useMetadataPanelStoreActions();
  const label = useMemo(
    () => getComponentLabel(component, { cubeIri }),
    [cubeIri, component]
  );
  const description = useMemo(() => {
    const description = getComponentDescription(component, cubeIri);
    if (!expanded && description && description.length > 180) {
      return `${description.slice(0, 180)}…`;
    }
    return description;
  }, [cubeIri, component, expanded]);

  const locale = useLocale();
  const cubesIri = useMemo(() => {
    return isJoinByComponent(component)
      ? component.originalIds.map((x) => x.cubeIri)
      : [component.cubeIri];
  }, [component]);
  const [cubesQuery] = useDataCubesMetadataQuery({
    variables: {
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters: cubesIri.map((iri) => ({ iri })),
    },
  });
  const cubesByIri = useMemo(
    () => keyBy(cubesQuery.data?.dataCubesMetadata, (x) => x.iri),
    [cubesQuery.data?.dataCubesMetadata]
  );
  const [componentsQuery] = useDataCubesComponentsQuery({
    pause: !expanded,
    variables: {
      cubeFilters: [
        {
          iri: component.cubeIri,
          loadValues: true,
          componentIds: [component.id],
        },
      ],
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
    },
  });
  const loadedComponent = useMemo(() => {
    return [
      ...(componentsQuery.data?.dataCubesComponents.dimensions ?? []),
      ...(componentsQuery.data?.dataCubesComponents.measures ?? []),
    ].find((d) => component.id === d.id);
  }, [
    componentsQuery.data?.dataCubesComponents.dimensions,
    componentsQuery.data?.dataCubesComponents.measures,
    component.id,
  ]);

  const handleClick = useCallback(() => {
    if (!expanded) {
      setSelectedComponent(component);
    }
  }, [expanded, component, setSelectedComponent]);

  return (
    <div>
      <Flex sx={{ justifyContent: "space-between" }}>
        <div>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              className={classes.dimensionButton}
              variant="text"
              size="sm"
              onClick={handleClick}
              sx={{
                lineHeight: 1,
                minHeight: "auto",
                padding: 0,
                typography: "body2",
                fontWeight: "bold",
                ":hover": { color: !expanded ? "primary.main" : "grey.800" },
                cursor: !expanded ? "pointer" : "default",
              }}
            >
              {label}
            </Button>
            {isJoinByComponent(component) ? (
              <>
                <JoinByChip
                  label={<Trans id="dimension.joined">Joined</Trans>}
                />
                <InfoIconTooltip
                  title={
                    <Trans id="dimension.joined-info-icon">
                      Joined dimensions integrate data from multiple datasets
                    </Trans>
                  }
                  placement="top-end"
                />
              </>
            ) : null}
          </Box>
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>
      </Flex>

      <AnimatePresence>
        {expanded && loadedComponent && loadedComponent.values.length > 0 && (
          <MotionBox
            key="dimension-values"
            className={classes.dimensionValues}
            {...animationProps}
          >
            {isJoinByComponent(component) ? (
              <div>
                <Typography variant="h5" gutterBottom>
                  Joined with
                </Typography>
                {component.originalIds.map((x) =>
                  x.cubeIri === loadedComponent.cubeIri ? null : (
                    <div key={x.cubeIri}>
                      <Typography variant="body2">
                        {x.label} ({cubesByIri[x.cubeIri]?.title})
                      </Typography>
                    </div>
                  )
                )}
              </div>
            ) : null}
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
            <ComponentValues component={loadedComponent} />
          </MotionBox>
        )}
      </AnimatePresence>
      {!expanded && (
        <Button
          component="a"
          variant="text"
          size="sm"
          onClick={handleClick}
          endIcon={<SvgIcArrowRight />}
          sx={{ p: 0 }}
        >
          <Trans id="controls.metadata-panel.show-more">Show more</Trans>
        </Button>
      )}
    </div>
  );
};

const ComponentValues = ({ component }: { component: Component }) => {
  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(component);
    return orderBy(
      component.values,
      sorters.map((s) => (dv) => s(dv.label))
    ) as DimensionValue[];
  }, [component]);

  if (
    isStandardErrorDimension(component) ||
    isConfidenceUpperBoundDimension(component) ||
    isConfidenceLowerBoundDimension(component)
  ) {
    return <MeasureValuesNumeric values={sortedValues} />;
  }

  switch (component.__typename) {
    case "NominalDimension":
    case "OrdinalDimension":
    case "TemporalEntityDimension":
    case "TemporalOrdinalDimension":
    case "OrdinalMeasure":
    case "GeoCoordinatesDimension":
    case "GeoShapesDimension":
      return <DimensionValuesNominal values={sortedValues} />;
    case "NumericalMeasure":
      return sortedValues.length > 0 ? (
        <MeasureValuesNumeric values={sortedValues} />
      ) : null;
    case "TemporalDimension":
      return <DimensionValuesTemporal dim={component} values={sortedValues} />;
    default:
      const _exhaustiveCheck: never = component;
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

const MeasureValuesNumeric = ({ values }: { values: DimensionValue[] }) => {
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
  const format = formatters[dim.id];
  const [min, max] = [values[0].value, values[values.length - 1].value];

  return (
    <>
      <Typography variant="body2">Min: {format(min)}</Typography>
      <Typography variant="body2">Max: {format(max)}</Typography>
    </>
  );
};
