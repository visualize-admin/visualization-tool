import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import groupBy from "lodash/groupBy";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import pickBy from "lodash/pickBy";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useClient } from "urql";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import {
  getPossibleFiltersQueryVariables,
  skipPossibleFiltersQuery,
} from "@/charts/shared/possible-filters";
import { Flex } from "@/components/flex";
import { Switch } from "@/components/form";
import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import {
  MetadataPanel,
  OpenMetadataPanelWrapper,
} from "@/components/metadata-panel";
import { MoveDragButton } from "@/components/move-drag-button";
import { useDisclosure } from "@/components/use-disclosure";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  DashboardFiltersConfig,
  DataSource,
  Filters,
  isMapConfig,
} from "@/config-types";
import { getChartConfig, getChartConfigFilters } from "@/config-utils";
import { ChartAnnotator } from "@/configurator/components/annotators";
import { FiltersBadge } from "@/configurator/components/badges";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { DatasetsControlSection } from "@/configurator/components/dataset-control-section";
import {
  ChartOptionCheckboxField,
  ControlTabField,
  DataFilterSelect,
  DataFilterTemporal,
  dimensionToFieldProps,
  OnOffControlTabField,
} from "@/configurator/components/field";
import { canRenderDatePickerField } from "@/configurator/components/field-date-picker";
import {
  getFiltersByMappingStatus,
  isConfiguring,
  moveFilterField,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useInteractiveDataFilterToggle } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFiltersConfigurator } from "@/configurator/interactive-filters/interactive-filters-configurator";
import {
  Dimension,
  isStandardErrorDimension,
  isTemporalDimension,
  Measure,
} from "@/domain/data";
import { isMostRecentValue } from "@/domain/most-recent-value";
import { truthy } from "@/domain/types";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { isJoinByCube } from "@/graphql/join";
import {
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { InteractiveFiltersChartProvider } from "@/stores/interactive-filters";
import { useEvent } from "@/utils/use-event";

export const DataFilterSelectGeneric = ({
  rawDimension,
  filterDimensionIds,
  index,
  disabled,
  onRemove,
  sideControls,
  disableLabel,
}: {
  rawDimension: Dimension;
  filterDimensionIds: string[];
  index: number;
  disabled?: boolean;
  onRemove?: () => void;
  sideControls?: ReactNode;
  disableLabel?: boolean;
}) => {
  const locale = useLocale();
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => {
        const rawFilters = pickBy(cube.filters, (_, key) =>
          filterDimensionIds.includes(key)
        );

        return {
          iri: cube.iri,
          joinBy: cube.joinBy,
          componentIds: [rawDimension.id],
          filters: Object.keys(rawFilters).length > 0 ? rawFilters : undefined,
          loadValues: true,
        };
      }),
    },
    keepPreviousData: true,
  });

  const dimension =
    data?.dataCubesComponents?.dimensions.find(
      (d) => d.cubeIri === rawDimension.cubeIri
    ) ?? rawDimension;

  const sharedProps = {
    dimension,
    label: disableLabel ? null : (
      <>
        <OpenMetadataPanelWrapper component={dimension}>
          <Typography variant="caption">
            {`${index + 1}. ${dimension.label}`}
          </Typography>
        </OpenMetadataPanelWrapper>
        <Flex
          sx={{
            alignSelf: "flex-end",
            alignItems: "center",
            gap: 1,
            marginRight: sideControls && dimension.isKeyDimension ? 7 : 0,
          }}
        >
          <InteractiveDataFilterToggle id={dimension.id} />
          {dimension.isKeyDimension ? null : (
            <IconButton
              disabled={disabled}
              size="small"
              onClick={onRemove}
              sx={{ p: 0, transform: "translateY(-5%)" }}
            >
              <Icon name="trash" size={16} />
            </IconButton>
          )}
        </Flex>
      </>
    ),
    sideControls,
    id: `select-single-filter-${index}`,
    disabled: fetching || disabled,
    optional: !dimension.isKeyDimension,
    loading: fetching,
  };

  if (
    isTemporalDimension(dimension) &&
    canRenderDatePickerField(dimension.timeUnit)
  ) {
    return (
      <DataFilterTemporal
        {...sharedProps}
        dimension={dimension}
        timeUnit={dimension.timeUnit}
      />
    );
  } else {
    return (
      <DataFilterSelect {...sharedProps} hierarchy={dimension.hierarchy} />
    );
  }
};

/**
 * This runs every time the state changes and it ensures that the selected filters
 * return at least 1 observation. Otherwise filters are reloaded.
 */
const useEnsurePossibleFilters = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing;
}) => {
  const [, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<Error>();
  const lastFilters = useRef<Record<string, Filters>>({});
  const client = useClient();
  const joinByIds = useMemo(() => {
    return chartConfig.cubes.flatMap((cube) => cube.joinBy).filter(truthy);
  }, [chartConfig.cubes]);

  useEffect(() => {
    const run = async () => {
      chartConfig.cubes.forEach(async (cube) => {
        const { mappedFilters, unmappedFilters } = getFiltersByMappingStatus(
          chartConfig,
          { cubeIri: cube.iri, joinByIds }
        );

        if (
          skipPossibleFiltersQuery(
            lastFilters.current[cube.iri],
            unmappedFilters
          )
        ) {
          return;
        }

        lastFilters.current[cube.iri] = unmappedFilters;
        setFetching(true);
        const variables = getPossibleFiltersQueryVariables({
          cubeIri: cube.iri,
          dataSource: state.dataSource,
          unmappedFilters,
        });
        const { data, error } = await client
          .query<
            PossibleFiltersQuery,
            PossibleFiltersQueryVariables
          >(PossibleFiltersDocument, variables)
          .toPromise();

        if (error || !data) {
          setError(error);
          setFetching(false);
          console.error("Could not fetch possible filters", error);

          return;
        }

        setError(undefined);
        setFetching(false);

        const filters = Object.assign(
          Object.fromEntries(
            data.possibleFilters.map((x) => [
              x.id,
              { type: x.type, value: x.value },
            ])
          ) as Filters,
          mappedFilters
        );

        const oldFilters = getChartConfigFilters(chartConfig.cubes, {
          cubeIri: cube.iri,
        });

        // Replace resolved values with potential dynamic max values to not
        // override the dynamic max value with the resolved value
        for (const [key, value] of Object.entries(oldFilters)) {
          if (
            value.type === "single" &&
            isMostRecentValue(value.value) &&
            filters[key]
          ) {
            filters[key] = {
              type: "single",
              value: `${value.value}`,
            };
          }
        }

        if (!isEqual(filters, oldFilters) && !isEmpty(filters)) {
          dispatch({
            type: "CHART_CONFIG_FILTERS_UPDATE",
            value: {
              cubeIri: cube.iri,
              filters,
            },
          });
        }
      });
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig,
    chartConfig.cubes,
    state.dataSource,
    joinByIds,
  ]);

  return { error, fetching };
};

export const getFilterReorderCubeFilters = (
  chartConfig: ChartConfig,
  { joinByIds }: { joinByIds: string[] }
) => {
  return chartConfig.cubes.map(({ iri, joinBy }) => {
    const { unmappedFilters } = getFiltersByMappingStatus(chartConfig, {
      cubeIri: iri,
      joinByIds,
    });

    return {
      iri,
      filters:
        Object.keys(unmappedFilters).length > 0 ? unmappedFilters : undefined,
      joinBy,
      loadValues: true,
    };
  });
};

const useFilterReorder = ({
  onAddDimensionFilter,
}: {
  onAddDimensionFilter?: () => void;
} = {}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const locale = useLocale();
  const filters = getChartConfigFilters(chartConfig.cubes, { joined: true });
  const joinByIds = useMemo(() => {
    return chartConfig.cubes.flatMap((cube) => cube.joinBy).filter(truthy);
  }, [chartConfig.cubes]);
  const { mappedFiltersIds } = useMemo(() => {
    return getFiltersByMappingStatus(chartConfig, { joinByIds });
  }, [chartConfig, joinByIds]);

  const variables = useMemo(() => {
    const cubeFilters = getFilterReorderCubeFilters(chartConfig, {
      joinByIds,
    });

    // This is important for urql not to think that filters
    // are the same  while the order of the keys has changed.
    // If this is not present, we'll have outdated dimension
    // values after we change the filter order
    const reQueryKey = cubeFilters.reduce((acc, d) => {
      return `${acc}${d.iri}${JSON.stringify(d.filters)}`;
    }, "");

    return {
      cubeFilters,
      reQueryKey: reQueryKey ? reQueryKey : undefined,
    };
  }, [chartConfig, joinByIds]);

  const [
    { data: componentsData, fetching: componentsFetching },
    executeComponentsQuery,
  ] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      ...variables,
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    executeComponentsQuery({
      variables: {
        sourceType: state.dataSource.type,
        sourceUrl: state.dataSource.url,
        locale,
        ...variables,
      },
    });
  }, [
    variables,
    executeComponentsQuery,
    state.dataSource.type,
    state.dataSource.url,
    locale,
  ]);

  const dimensions = componentsData?.dataCubesComponents?.dimensions;
  const measures = componentsData?.dataCubesComponents?.measures;

  // Handlers
  const handleMove = useEvent((dimensionId: string, delta: number) => {
    if (!dimensions || !measures) {
      return;
    }

    const dimension = dimensions.find((d) => d.id === dimensionId);

    if (dimension) {
      const newChartConfig = moveFilterField(chartConfig, {
        dimension,
        delta,
        possibleValues: dimension ? dimension.values.map((d) => d.value) : [],
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: newChartConfig,
          dataCubesComponents: {
            dimensions,
            measures,
          },
        },
      });
    }
  });

  const handleAddDimensionFilter = useEvent((dimension: Dimension) => {
    onAddDimensionFilter?.();
    const filterValue = dimension.values[0];
    dispatch({
      type: "FILTER_SET_SINGLE",
      value: {
        filters: dimensionToFieldProps(dimension),
        value: `${filterValue.value}`,
      },
    });
  });

  const handleRemoveDimensionFilter = useEvent((dimension: Dimension) => {
    dispatch({
      type: "FILTER_REMOVE_SINGLE",
      value: {
        filters: dimensionToFieldProps(dimension),
      },
    });
  });

  const handleDragEnd: OnDragEndResponder = useEvent((result) => {
    const sourceIndex = result.source?.index;
    const destinationIndex = result.destination?.index;
    if (
      typeof sourceIndex !== "number" ||
      typeof destinationIndex !== "number" ||
      result.source === result.destination
    ) {
      return;
    }
    const delta = destinationIndex - sourceIndex;
    handleMove(result.draggableId, delta);
  });

  const { fetching: possibleFiltersFetching } = useEnsurePossibleFilters({
    state,
  });
  const fetching = possibleFiltersFetching || componentsFetching;
  const {
    filterDimensions,
    filterDimensionsByCubeIri,
    addableDimensions,
    addableDimensionsByCubeIri,
    missingDimensions,
  } = useMemo(() => {
    const keysOrder = Object.fromEntries(
      Object.keys(filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      dimensions?.filter(
        (dim) =>
          !mappedFiltersIds.has(dim.id) && keysOrder[dim.id] !== undefined
      ) ?? [],
      [(x) => keysOrder[x.id] ?? Infinity]
    );
    const filterDimensionsByCubeIri = groupBy(
      filterDimensions,
      (d) => d.cubeIri
    );
    const allCubeIris = uniq(dimensions?.map((d) => d.cubeIri));

    // Make sure we don't forget about merged cubes that have non-key-dimensions
    // available, but no key dimension available (might be the case when merging)
    // cubes by a lot of key dimensions that get joinBy cube iri then.
    for (const iri of allCubeIris) {
      if (!filterDimensionsByCubeIri[iri]) {
        filterDimensionsByCubeIri[iri] = [];
      }
    }

    const addableDimensions =
      dimensions?.filter(
        (dim) =>
          !mappedFiltersIds.has(dim.id) &&
          keysOrder[dim.id] === undefined &&
          !isStandardErrorDimension(dim)
      ) ?? [];
    const addableDimensionsByCubeIri = groupBy(
      addableDimensions,
      (d) => d.cubeIri
    );
    const missingDimensions = dimensions?.filter(
      (d) => d.isKeyDimension && addableDimensions?.includes(d)
    );

    return {
      filterDimensions,
      filterDimensionsByCubeIri,
      addableDimensions,
      addableDimensionsByCubeIri,
      missingDimensions,
    };
  }, [dimensions, filters, mappedFiltersIds]);

  // Technically it's possible to have a key dimension that is not in the filters
  // and not mapped. This could be achieved for example by manually modifying the
  // localStorage state and removing a filter. This is a safety net to ensure that
  // the relevant key dimensions are always in the filters.
  useEffect(() => {
    if (missingDimensions && missingDimensions.length > 0) {
      missingDimensions.forEach(handleAddDimensionFilter);
    }
  }, [handleAddDimensionFilter, missingDimensions]);

  return {
    handleRemoveDimensionFilter,
    handleAddDimensionFilter,
    handleDragEnd,
    fetching,
    dimensions,
    measures,
    filterDimensions,
    filterDimensionsByCubeIri,
    addableDimensions,
    addableDimensionsByCubeIri,
  };
};

const useStyles = makeStyles<Theme, { fetching: boolean }>((theme) => ({
  loadingIndicator: {
    color: theme.palette.grey[700],
    display: "inline-block",
    marginLeft: 8,
  },
  filterRow: {
    overflow: "hidden",
    width: "100%",
    marginBottom: theme.spacing(5),

    "& > *": {
      overflow: "hidden",
    },

    "&:last-child": {
      marginBottom: 0,
    },
  },
  addDimensionContainer: {
    "& .menu-button": {
      background: "transparent",
      border: 0,
      padding: 0,
    },
  },
}));

const InteractiveDataFilterToggle = ({ id }: { id: string }) => {
  const { checked, toggle } = useInteractiveDataFilterToggle(id);

  return (
    <Switch
      size="sm"
      label={t({
        id: "controls.filters.interactive.toggle",
        message: "Interactive",
      })}
      checked={checked}
      onChange={toggle}
    />
  );
};

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const chartConfig = getChartConfig(state);
  const [
    {
      data: dataCubesMetadataData,
      fetching: fetchingDataCubesMetadata,
      error: dataCubesMetadataError,
    },
  ] = useDataCubesMetadataQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
    pause: chartConfig.cubes.length === 1,
  });
  const cubes = dataCubesMetadataData?.dataCubesMetadata;
  const {
    fetching: fetchingData,
    handleRemoveDimensionFilter,
    handleDragEnd,
    dimensions,
    measures,
    filterDimensions,
    filterDimensionsByCubeIri,
    addableDimensions,
    addableDimensionsByCubeIri,
  } = useFilterReorder();
  const { fetching: fetchingPossibleFilters, error: possibleFiltersError } =
    useEnsurePossibleFilters({
      state,
    });
  const error = dataCubesMetadataError || possibleFiltersError;
  const fetching =
    fetchingPossibleFilters || fetchingData || fetchingDataCubesMetadata;
  const classes = useStyles({ fetching });
  const components = useMemo(() => {
    return [...(dimensions ?? []), ...(measures ?? [])];
  }, [dimensions, measures]);

  if (components.length === 0) {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }

  return (
    <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
      <DatasetsControlSection />
      <ControlSection collapse>
        <SectionTitle id="controls-design">
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SectionTitle>
        <ControlSectionContent>
          <ChartTypeSelector
            showHelp={false}
            chartKey={chartConfig.key}
            state={state}
          />
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SectionTitle id="controls-design">
          <Trans id="controls.section.chart.options">Chart Options</Trans>
        </SectionTitle>
        <ControlSectionContent
          gap="none"
          px="none"
          role="tablist"
          aria-labelledby="controls-design"
        >
          <ChartFields
            dataSource={state.dataSource}
            chartConfig={chartConfig}
            dashboardFilters={state.dashboardFilters}
            dimensions={dimensions}
            measures={measures}
          />
        </ControlSectionContent>
      </ControlSection>
      {filterDimensions.length === 0 &&
      addableDimensions &&
      addableDimensions.length === 0 ? null : (
        <ControlSection collapse>
          <SectionTitle id="controls-data">
            <Trans id="controls.section.data.filters">Filters</Trans>{" "}
            {fetching ? (
              <CircularProgress
                size={12}
                className={classes.loadingIndicator}
              />
            ) : null}
            <FiltersBadge sx={{ ml: "auto", mr: 2 }} />
          </SectionTitle>
          <ControlSectionContent
            aria-labelledby="controls-data"
            data-testid="configurator-filters"
          >
            {error ? (
              <Typography variant="body2" color="error">
                <Trans id="controls.section.data.filters.possible-filters-error">
                  An error happened while fetching possible filters, please
                  retry later or reload the page.
                </Trans>
              </Typography>
            ) : null}
            {filterDimensions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: -4 }}
              >
                <Trans id="controls.section.data.filters.none">
                  No filters
                </Trans>
              </Typography>
            ) : (
              <Box sx={{ my: 2 }}>
                <ChartOptionCheckboxField
                  label={t({
                    id: "controls.section.data.filters.default-open",
                    message: "Show filter area open",
                  })}
                  field={null}
                  path="interactiveFiltersConfig.dataFilters.defaultOpen"
                  disabled={
                    !chartConfig.interactiveFiltersConfig?.dataFilters.active
                  }
                />
              </Box>
            )}
            {Object.entries(filterDimensionsByCubeIri)
              .sort((a, b) =>
                isJoinByCube(a[0])
                  ? -1
                  : isJoinByCube(b[0])
                    ? 1
                    : a[0].localeCompare(b[0])
              )
              .map(([cubeIri, dims]) => {
                const cubeTitle = cubes?.find(
                  (cube) => cube.iri === cubeIri
                )?.title;
                const cubeAddableDims = addableDimensionsByCubeIri[cubeIri];

                return dims.length > 0 ? (
                  <Fragment key={cubeIri}>
                    <Box sx={{ py: 2 }}>
                      {cubeTitle ? (
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{ mb: 3, color: "text.secondary" }}
                        >
                          {cubeTitle}
                        </Typography>
                      ) : null}
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="filters">
                          {(provided) => (
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {dims.map((dim, i) => (
                                <Draggable
                                  key={dim.id}
                                  isDragDisabled={fetching}
                                  draggableId={dim.id}
                                  index={i}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      className={classes.filterRow}
                                      {...provided.dragHandleProps}
                                      {...provided.draggableProps}
                                    >
                                      <DataFilterSelectGeneric
                                        key={dim.id}
                                        rawDimension={dim}
                                        filterDimensionIds={filterDimensions
                                          .filter((d) => d.cubeIri === cubeIri)
                                          .slice(0, i)
                                          .map((d) => d.id)}
                                        index={i}
                                        disabled={fetching}
                                        onRemove={() =>
                                          handleRemoveDimensionFilter(dim)
                                        }
                                        sideControls={<MoveDragButton />}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Box>
                    {cubeAddableDims && cubeAddableDims.length > 0 ? (
                      <AddFilterButton dims={cubeAddableDims} />
                    ) : null}
                  </Fragment>
                ) : null;
              })}
          </ControlSectionContent>
        </ControlSection>
      )}
      <ChartAnnotator />
      {chartConfig.chartType !== "table" && (
        <InteractiveFiltersConfigurator state={state} />
      )}
      <MetadataPanel
        dataSource={state.dataSource}
        chartConfig={chartConfig}
        dashboardFilters={state.dashboardFilters}
        components={components}
        top={HEADER_HEIGHT_CSS_VAR}
        renderToggle={false}
      />
    </InteractiveFiltersChartProvider>
  );
};

const AddFilterButton = ({ dims }: { dims: Dimension[] }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isMenuOpen,
    open: openMenu,
    close: closeMenu,
  } = useDisclosure();
  const { handleAddDimensionFilter } = useFilterReorder({
    onAddDimensionFilter: () => closeMenu(),
  });
  const classes = useStyles({ fetching: false });

  return (
    <Box className={classes.addDimensionContainer}>
      <Button
        variant="outlined"
        size="sm"
        ref={ref}
        onClick={openMenu}
        startIcon={<Icon name="plus" size={20} />}
      >
        <Trans>Add filter</Trans>
      </Button>
      <Menu anchorEl={ref.current} open={isMenuOpen} onClose={closeMenu}>
        {dims.map((dim) => (
          <MenuItem key={dim.id} onClick={() => handleAddDimensionFilter(dim)}>
            {dim.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const ChartFields = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  dimensions,
  measures,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  dimensions?: Dimension[];
  measures?: Measure[];
}) => {
  const components = [...(dimensions ?? []), ...(measures ?? [])];
  const queryFilters = useQueryFilters({ chartConfig, dashboardFilters });
  const locale = useLocale();
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    chartConfig,
    variables: {
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters: queryFilters,
    },
  });
  const observations = observationsData?.dataCubesObservations?.data ?? [];

  return (
    <>
      {getChartSpec(chartConfig)
        .encodings.filter((d) => !d.hide)
        .map(({ field, getDisabledState, idAttributes }) => {
          const componentIds = idAttributes
            .flatMap(
              (x) =>
                // componentId or componentIds
                (chartConfig.fields as any)[field]?.[x] as string | string[]
            )
            .filter(truthy);
          const fieldComponents = componentIds
            .map((cId) => components.find((d) => cId === d.id))
            .filter(truthy);
          const baseLayer = isMapConfig(chartConfig) && field === "baseLayer";
          const customLayers =
            isMapConfig(chartConfig) && field === "customLayers";

          return baseLayer ? (
            <OnOffControlTabField
              key={field}
              value={field}
              icon="baseLayer"
              label={<Trans id="chart.map.layers.base">Base map</Trans>}
              active={chartConfig.baseLayer.show}
            />
          ) : customLayers ? (
            <OnOffControlTabField
              key={field}
              value={field}
              icon="customLayers"
              label={
                <Trans id="chart.map.layers.custom-layers">Import map</Trans>
              }
              active={
                chartConfig.baseLayer.show &&
                chartConfig.baseLayer.customLayers.length > 0
              }
            />
          ) : (
            <ControlTabField
              key={field}
              chartConfig={chartConfig}
              fieldComponents={
                isMapConfig(chartConfig) && field === "symbolLayer"
                  ? chartConfig.fields.symbolLayer
                    ? fieldComponents
                    : undefined
                  : fieldComponents
              }
              value={field}
              labelId={`${chartConfig.chartType}.${field}`}
              {...getDisabledState?.(chartConfig, components, observations)}
            />
          );
        })}
    </>
  );
};
