import { t, Trans } from "@lingui/macro";
import {
  Badge,
  BadgeProps,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  FormControlLabelProps,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import omitBy from "lodash/omitBy";
import sortBy from "lodash/sortBy";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useClient } from "urql";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import useDisclosure from "@/components/use-disclosure";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  DataSource,
  getChartConfig,
  isMapConfig,
} from "@/configurator";
import { TitleAndDescriptionConfigurator } from "@/configurator/components/chart-annotator";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SubsectionTitle,
  useControlSectionContext,
} from "@/configurator/components/chart-controls/section";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import {
  ControlTabField,
  DataFilterSelect,
  DataFilterSelectDay,
  DataFilterSelectTime,
  OnOffControlTabField,
} from "@/configurator/components/field";
import MoveDragButtons from "@/configurator/components/move-drag-buttons";
import {
  getFiltersByMappingStatus,
  isConfiguring,
  moveFilterField,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useInteractiveDataFilterToggle } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFiltersConfigurator } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { isStandardErrorDimension, isTemporalDimension } from "@/domain/data";
import {
  DimensionMetadataWithHierarchiesFragment,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import {
  DataCubeMetadata,
  DataCubeMetadataWithHierarchies,
} from "@/graphql/types";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

type DataFilterSelectGenericProps = {
  dimension: DimensionMetadataWithHierarchiesFragment;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
};

const DataFilterSelectGeneric = (props: DataFilterSelectGenericProps) => {
  const { dimension, index, disabled, onRemove } = props;
  const values = dimension.values;
  const controls = dimension.isKeyDimension ? null : (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <IconButton
        disabled={disabled}
        sx={{ ml: 2, p: 0 }}
        onClick={onRemove}
        size="small"
      >
        <Icon name="trash" size="16" />
      </IconButton>
    </Box>
  );

  const sharedProps = {
    dimension,
    label: (
      <OpenMetadataPanelWrapper dim={dimension}>
        <span>{`${index + 1}. ${dimension.label}`}</span>
      </OpenMetadataPanelWrapper>
    ),
    controls,
    id: `select-single-filter-${index}`,
    disabled,
    isOptional: !dimension.isKeyDimension,
  };

  if (isTemporalDimension(dimension)) {
    if (dimension.timeUnit === "Day") {
      return <DataFilterSelectDay {...sharedProps} />;
    } else if (dimension.timeUnit === "Month") {
      return <DataFilterSelect {...sharedProps} />;
    } else {
      const from = `${values[0].value}`;
      const to = `${values[values.length - 1]?.value || from}`;

      return (
        <DataFilterSelectTime
          {...sharedProps}
          from={from}
          to={to}
          timeUnit={dimension.timeUnit}
          timeFormat={dimension.timeFormat}
        />
      );
    }
  } else {
    return (
      <DataFilterSelect
        {...sharedProps}
        hierarchy={dimension.hierarchy as HierarchyValue[] | undefined}
      />
    );
  }
};

export const orderedIsEqual = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
) => {
  return isEqual(Object.keys(obj1), Object.keys(obj2)) && isEqual(obj1, obj2);
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
  const lastFilters = useRef<ChartConfig["filters"]>();
  const client = useClient();

  useEffect(() => {
    const run = async () => {
      const { mappedFilters, unmappedFilters } =
        getFiltersByMappingStatus(chartConfig);
      if (
        lastFilters.current &&
        orderedIsEqual(lastFilters.current, unmappedFilters)
      ) {
        return;
      }
      lastFilters.current = unmappedFilters;

      setFetching(true);
      const { data, error } = await client
        .query<PossibleFiltersQuery, PossibleFiltersQueryVariables>(
          PossibleFiltersDocument,
          {
            iri: state.dataSet,
            sourceType: state.dataSource.type,
            sourceUrl: state.dataSource.url,
            filters: unmappedFilters,

            // @ts-ignore This is to make urql requery
            filterKey: Object.keys(unmappedFilters).join(", "),
          }
        )
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
            x.iri,
            { type: x.type, value: x.value },
          ])
        ) as ChartConfig["filters"],
        mappedFilters
      );

      if (!isEqual(filters, chartConfig.filters) && !isEmpty(filters)) {
        dispatch({
          type: "CHART_CONFIG_FILTERS_UPDATE",
          value: {
            filters,
          },
        });
      }
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig,
    state.dataSet,
    state.dataSource.type,
    state.dataSource.url,
  ]);

  return { error, fetching };
};

type Dimension = NonNullable<
  NonNullable<DataCubeMetadata>["dimensions"]
>[number];

const useFilterReorder = ({
  onAddDimensionFilter,
}: {
  onAddDimensionFilter?: () => void;
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const locale = useLocale();

  const { filters } = chartConfig;
  const { unmappedFilters, mappedFiltersIris } = useMemo(() => {
    return getFiltersByMappingStatus(chartConfig);
  }, [chartConfig]);

  const variables = useMemo(() => {
    const hasUnmappedFilters = Object.keys(unmappedFilters).length > 0;
    const vars = {
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      filters: hasUnmappedFilters ? unmappedFilters : undefined,
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order
      filterKeys: hasUnmappedFilters
        ? Object.keys(unmappedFilters).join(", ")
        : undefined,
    };

    return omitBy(vars, (x) => x === undefined) as typeof vars;
  }, [
    state.dataSet,
    state.dataSource.type,
    state.dataSource.url,
    locale,
    unmappedFilters,
  ]);

  const [{ data: metadata, fetching: metadataFetching }, executeMetadataQuery] =
    useDataCubeMetadataQuery({ variables });
  const [
    { data: components, fetching: componentsFetching },
    exectueComponentsQuery,
  ] = useComponentsWithHierarchiesQuery({ variables });

  useEffect(() => {
    executeMetadataQuery({
      variables,
    });
    exectueComponentsQuery({
      variables,
    });
  }, [variables, executeMetadataQuery, exectueComponentsQuery]);

  const dimensions = useMemo(() => {
    const dimensions = components?.dataCubeByIri?.dimensions;
    type T = Exclude<typeof dimensions, undefined>;

    if (!components?.dataCubeByIri?.dimensions) {
      return [] as T;
    }

    return dimensions as T;
  }, [components?.dataCubeByIri?.dimensions]);

  const data =
    metadata?.dataCubeByIri && components?.dataCubeByIri
      ? ({
          ...metadata.dataCubeByIri,
          ...components.dataCubeByIri,
        } as DataCubeMetadataWithHierarchies)
      : null;

  // Handlers
  const handleMove = useEvent((dimensionIri: string, delta: number) => {
    if (!data) {
      return;
    }

    const dimension = dimensions.find((d) => d.iri === dimensionIri);
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri,
      delta,
      possibleValues: dimension ? dimension.values : [],
    });

    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig: newChartConfig,
        dataSetMetadata: data,
      },
    });
  });

  const handleAddDimensionFilter = useEvent((dimension: Dimension) => {
    onAddDimensionFilter?.();
    const filterValue = dimension.values[0];
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_SINGLE",
      value: {
        dimensionIri: dimension.iri,
        value: `${filterValue.value}`,
      },
    });
  });

  const handleRemoveDimensionFilter = useEvent((dimension: Dimension) => {
    dispatch({
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE",
      value: {
        dimensionIri: dimension.iri,
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
  const fetching =
    possibleFiltersFetching || metadataFetching || componentsFetching;

  const { filterDimensions, addableDimensions } = useMemo(() => {
    const keysOrder = Object.fromEntries(
      Object.keys(filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      dimensions.filter(
        (dim) =>
          !mappedFiltersIris.has(dim.iri) && keysOrder[dim.iri] !== undefined
      ) || [],
      [(x) => keysOrder[x.iri] ?? Infinity]
    );
    const addableDimensions = dimensions.filter(
      (dim) =>
        !mappedFiltersIris.has(dim.iri) &&
        keysOrder[dim.iri] === undefined &&
        !isStandardErrorDimension(dim)
    );
    return {
      filterDimensions,
      addableDimensions,
    };
  }, [dimensions, filters, mappedFiltersIris]);

  return {
    handleRemoveDimensionFilter,
    handleAddDimensionFilter,
    handleMove,
    handleDragEnd,
    fetching,
    data,
    filterDimensions,
    addableDimensions,
  };
};

const useStyles = makeStyles<Theme, { fetching: boolean }>((theme) => ({
  loadingIndicator: {
    color: theme.palette.grey[700],
    display: "inline-block",
    marginLeft: 8,
  },
  filtersContainer: {
    "& > * + *": { marginTop: theme.spacing(3) },
    marginBottom: 4,
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "auto min-content",
    overflow: "hidden",
    width: "100%",
    gridColumnGap: theme.spacing(2),
    gridTemplateRows: "min-content min-content",
    gridTemplateAreas: '"description drag-button" "select drag-button"',
    "& .buttons": {
      transition: "color 0.125s ease, opacity 0.125s ease-out",
      opacity: 0.25,
      color: theme.palette.secondary.active,
    },
    "& .buttons:hover": {
      // Type inheritance is broken when one level of nesting is added
      opacity: ({ fetching }: { fetching: boolean }) =>
        fetching ? undefined : 1,
    },
    "& > *": {
      overflow: "hidden",
    },
  },
  dragButtons: {
    gridArea: "drag-button",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 0,
    flexShrink: 0,
    paddingBottom: 0,
  },
  addDimensionContainer: {
    marginTop: "1rem",
    paddingLeft: theme.spacing(2),
    "& .menu-button": {
      background: "transparent",
      border: 0,
      padding: 0,
    },
  },
  addDimensionButton: {
    display: "flex",
    minWidth: "auto",
    justifyContent: "center",
  },
}));

const InteractiveDataFilterCheckbox = ({
  value,
  ...props
}: { value: string } & Omit<FormControlLabelProps, "control" | "label">) => {
  const { checked, toggle } = useInteractiveDataFilterToggle(value);

  return (
    <FormControlLabel
      componentsProps={{
        typography: { variant: "caption", color: "text.secondary" },
      }}
      {...props}
      control={<Switch checked={checked} onChange={() => toggle()} />}
      label={
        <Tooltip
          enterDelay={600}
          arrow
          title={
            <span>
              <Trans id="controls.filters.interactive.tooltip">
                Allow users to change filters
              </Trans>
            </span>
          }
        >
          <Typography variant="caption">
            <Trans id="controls.filters.interactive.toggle">Interactive</Trans>
          </Typography>
        </Tooltip>
      }
    />
  );
};

const FiltersBadge = ({ sx }: { sx?: BadgeProps["sx"] }) => {
  const ctx = useControlSectionContext();
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  return (
    <Badge
      invisible={ctx.isOpen}
      badgeContent={
        Object.values(chartConfig.filters).filter((d) => d.type === "single")
          .length
      }
      color="secondary"
      sx={{ display: "block", ...sx }}
    />
  );
};

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = getChartConfig(state);
  const {
    isOpen: isFilterMenuOpen,
    open: openFilterMenu,
    close: closeFilterMenu,
  } = useDisclosure();
  const {
    fetching: dataFetching,
    handleAddDimensionFilter,
    handleRemoveDimensionFilter,
    handleDragEnd,
    data,
    filterDimensions,
    addableDimensions,
    handleMove,
  } = useFilterReorder({
    onAddDimensionFilter: () => closeFilterMenu(),
  });
  const { fetching: possibleFiltersFetching, error: possibleFiltersError } =
    useEnsurePossibleFilters({
      state,
    });
  const fetching = possibleFiltersFetching || dataFetching;

  const filterMenuButtonRef = useRef(null);

  const classes = useStyles({ fetching });

  if (!data) {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }

  return (
    <>
      <ControlSection collapse>
        <SubsectionTitle titleId="controls-design" gutterBottom={false}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SubsectionTitle>
        <ControlSectionContent px="small">
          <ChartTypeSelector
            showHelp={false}
            chartKey={chartConfig.key}
            state={state}
            sx={{ mt: 2 }}
          />
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SubsectionTitle titleId="controls-design" gutterBottom={false}>
          <Trans id="controls.section.chart.options">Chart Options</Trans>
        </SubsectionTitle>
        <ControlSectionContent
          px="small"
          gap="none"
          role="tablist"
          aria-labelledby="controls-design"
        >
          <ChartFields
            dataSource={state.dataSource}
            chartConfig={chartConfig}
            metadata={data}
          />
        </ControlSectionContent>
      </ControlSection>
      {filterDimensions.length === 0 &&
      addableDimensions.length === 0 ? null : (
        <ControlSection className={classes.filterSection} collapse>
          <SubsectionTitle titleId="controls-data" gutterBottom={false}>
            <Trans id="controls.section.data.filters">Filters</Trans>{" "}
            {fetching ? (
              <CircularProgress
                size={12}
                className={classes.loadingIndicator}
              />
            ) : null}
            <FiltersBadge sx={{ ml: "auto", mr: 4 }} />
          </SubsectionTitle>
          <ControlSectionContent
            aria-labelledby="controls-data"
            data-testid="configurator-filters"
          >
            {possibleFiltersError ? (
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
            ) : null}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="filters">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    className={classes.filtersContainer}
                    ref={provided.innerRef}
                  >
                    {filterDimensions.map((dimension, i) => (
                      <Draggable
                        isDragDisabled={fetching}
                        draggableId={dimension.iri}
                        index={i}
                        key={dimension.iri}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            className={classes.filterRow}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                          >
                            <div>
                              <InteractiveDataFilterCheckbox
                                value={dimension.iri}
                                sx={{ mb: 1 }}
                              />
                            </div>
                            <DataFilterSelectGeneric
                              key={dimension.iri}
                              dimension={dimension}
                              index={i}
                              disabled={fetching}
                              onRemove={() =>
                                handleRemoveDimensionFilter(dimension)
                              }
                            />

                            <Box className={classes.dragButtons}>
                              <MoveDragButtons
                                moveUpButtonProps={{
                                  title: t({ id: "Move filter up" }),
                                }}
                                moveDownButtonProps={{
                                  title: t({ id: "Move filter down" }),
                                }}
                                dragButtonProps={{
                                  title: t({
                                    id: "Drag filters to reorganize",
                                  }),
                                }}
                                className="buttons"
                                onClickUp={() => handleMove(dimension.iri, -1)}
                                onClickDown={() => handleMove(dimension.iri, 1)}
                              />
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
            {addableDimensions.length > 0 ? (
              <Box className={classes.addDimensionContainer}>
                <Button
                  ref={filterMenuButtonRef}
                  onClick={openFilterMenu}
                  variant="contained"
                  className={classes.addDimensionButton}
                  color="primary"
                >
                  <Trans>Add filter</Trans>
                  <Icon name="add" height={18} />
                </Button>
                <Menu
                  anchorEl={filterMenuButtonRef.current}
                  open={isFilterMenuOpen}
                  onClose={closeFilterMenu}
                >
                  {addableDimensions.map((dim) => (
                    <MenuItem
                      onClick={() => handleAddDimensionFilter(dim)}
                      key={dim.iri}
                    >
                      {dim.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : null}
          </ControlSectionContent>
        </ControlSection>
      )}
      <TitleAndDescriptionConfigurator />
      {chartConfig.chartType !== "table" && (
        <InteractiveFiltersConfigurator state={state} />
      )}
    </>
  );
};

type ChartFieldsProps = {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  metadata: DataCubeMetadata;
};

const ChartFields = (props: ChartFieldsProps) => {
  const { dataSource, chartConfig, metadata } = props;
  const { dimensions, measures } = metadata;
  const components = [...dimensions, ...measures];
  const queryFilters = useQueryFilters({ chartConfig });
  const locale = useLocale();

  const [{ data: observationsData }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: metadata.iri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      componentIris: components.map((d) => d.iri),
      filters: queryFilters,
    },
  });
  const observations = observationsData?.dataCubeByIri?.observations.data ?? [];

  return (
    <>
      {getChartSpec(chartConfig)
        .encodings.filter((d) => !d.hide)
        .map((encoding) => {
          const { field, getDisabledState } = encoding;
          const component = components.find(
            (d) => d.iri === (chartConfig.fields as any)[field]?.componentIri
          );
          const baseLayer = isMapConfig(chartConfig) && field === "baseLayer";

          return baseLayer ? (
            <OnOffControlTabField
              key={field}
              value={field}
              icon="baseLayer"
              label={<Trans id="chart.map.layers.base">Map Display</Trans>}
              active={chartConfig.baseLayer.show}
            />
          ) : (
            <ControlTabField
              key={field}
              chartConfig={chartConfig}
              component={
                isMapConfig(chartConfig) && field === "symbolLayer"
                  ? chartConfig.fields.symbolLayer
                    ? component
                    : undefined
                  : component
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
