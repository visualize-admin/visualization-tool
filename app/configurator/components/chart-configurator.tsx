import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { isEmpty, isEqual, sortBy } from "lodash";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  ReactElement,
} from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useClient } from "urql";

import { getFieldComponentIris } from "@/charts";
import { chartConfigOptionsUISpec } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
  isMapConfig,
  OptionGroup,
  Option,
} from "@/configurator";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ControlTabField,
  DataFilterSelect,
  DataFilterSelectDay,
  DataFilterSelectTime,
  OnOffControlTabField,
} from "@/configurator/components/field";
import MoveDragButtons from "@/configurator/components/move-drag-buttons";
import useDisclosure from "@/configurator/components/use-disclosure";
import {
  getFiltersByMappingStatus,
  isConfiguring,
  moveFilterField,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isStandardErrorDimension } from "@/domain/data";
import {
  DataCubeMetadataWithComponentValuesQuery,
  HierarchyValue,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
  useDataCubeMetadataWithComponentValuesQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { Icon } from "@/icons";
import useEvent from "@/lib/use-event";
import { useLocale } from "@/locales/use-locale";

import useHierarchyParents from "./use-hierarchy-parents";

const asGroup = (
  parents: Omit<HierarchyValue, "depth" | "__typename" | "children">[]
) => {
  return {
    label: parents.map((p) => p.label).join(" > "),
    value: parents.map((p) => p.value).join("$"),
  };
};

const DataFilterSelectGeneric = ({
  dimension,
  index,
  disabled,
  onRemove,
}: {
  dimension: DataCubeMetadata["dimensions"][number];
  isOptional?: boolean;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
}) => {
  const [state] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const hierarchyParents = useHierarchyParents(
    state.dataSet,
    state.dataSource,
    dimension,
    locale
  );

  const values = dimension.values;

  const optionGroups = useMemo(() => {
    if (hierarchyParents) {
      return hierarchyParents.map(
        ([parents, dfsRes]) =>
          [asGroup(parents), dfsRes.map((d) => d.node)] as [
            OptionGroup,
            Option[]
          ]
      );
    } else {
      return undefined;
    }
  }, [hierarchyParents]);

  const controls = dimension.isKeyDimension ? null : (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <IconButton
        disabled={disabled}
        sx={{ ml: 2, p: 0 }}
        onClick={onRemove}
        size="small"
      >
        <Icon name="trash" width="16" height="16" />
      </IconButton>
    </Box>
  );

  const sharedProps = {
    dimensionIri: dimension.iri,
    label: `${index + 1}. ${dimension.label}`,
    controls: controls,
    id: `select-single-filter-${index}`,
    disabled: disabled,
    isOptional: !dimension.isKeyDimension,
  };

  let component: ReactElement;
  if (dimension.__typename === "TemporalDimension") {
    if (dimension.timeUnit === "Day") {
      component = <DataFilterSelectDay {...sharedProps} options={values} />;
    } else if (dimension.timeUnit === "Month") {
      component = <DataFilterSelect {...sharedProps} options={values} />;
    } else {
      component = (
        <DataFilterSelectTime
          {...sharedProps}
          from={values[0].value}
          to={values[1].value}
          timeUnit={dimension.timeUnit}
          timeFormat={dimension.timeFormat}
        />
      );
    }
  } else {
    component = (
      <DataFilterSelect
        {...sharedProps}
        options={values}
        optionGroups={optionGroups}
      />
    );
  }

  return <Box sx={{ pl: 2, flexGrow: 1 }}>{component}</Box>;
};

const orderedIsEqual = (
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
  state:
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateDescribingChart
    | ConfiguratorStatePublishing;
}) => {
  const [, dispatch] = useConfiguratorState();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<Error>();
  const lastFilters = useRef<ChartConfig["filters"]>();
  const client = useClient();

  useEffect(() => {
    const run = async () => {
      const { mapped: mappedFilters, unmapped: unmappedFilters } =
        getFiltersByMappingStatus(
          state.chartConfig.fields,
          state.chartConfig.filters
        );
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
        console.warn("Could not fetch possible filters", error);
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

      if (!isEqual(filters, state.chartConfig.filters) && !isEmpty(filters)) {
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
    state,
    state.chartConfig.fields,
    state.chartConfig.filters,
    state.dataSet,
    state.dataSource.type,
    state.dataSource.url,
  ]);
  return { error, fetching };
};

type Dimension = NonNullable<
  NonNullable<
    DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
  >["dimensions"]
>[number];

const useFilterReorder = ({
  onAddDimensionFilter,
}: {
  onAddDimensionFilter?: () => void;
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const locale = useLocale();

  const { fields, filters } = state.chartConfig;
  const { unmapped: unmappedFilters } = useMemo(
    () => getFiltersByMappingStatus(fields, filters),
    [fields, filters]
  );

  const variables = useMemo(
    () => ({
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      filters: unmappedFilters,
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order
      filterKeys: Object.keys(unmappedFilters).join(", "),
    }),
    [
      state.dataSet,
      state.dataSource.type,
      state.dataSource.url,
      locale,
      unmappedFilters,
    ]
  );

  const [{ data, fetching: dataFetching }, executeQuery] =
    useDataCubeMetadataWithComponentValuesQuery({
      variables: variables,
    });

  useEffect(() => {
    executeQuery({
      variables,
    });
  }, [variables, executeQuery]);

  const dimensions = useMemo(() => {
    const dimensions = data?.dataCubeByIri?.dimensions;
    type T = Exclude<typeof dimensions, undefined>;
    if (!data?.dataCubeByIri?.dimensions) {
      return [] as T;
    }
    return dimensions as T;
  }, [data?.dataCubeByIri?.dimensions]);

  const metaData = data?.dataCubeByIri;

  // Handlers
  const handleMove = useEvent((dimensionIri: string, delta: number) => {
    if (!metaData) {
      return;
    }

    const dimension = dimensions.find((d) => d.iri === dimensionIri);
    const chartConfig = moveFilterField(state.chartConfig, {
      dimensionIri,
      delta,
      possibleValues: dimension ? dimension.values : [],
    });

    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig,
        dataSetMetadata: metaData,
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
        value: filterValue.value,
      },
    });
  });

  const handleRemoveDimensionFilter = useEvent((dimension: Dimension) => {
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_SINGLE",
      value: {
        dimensionIri: dimension.iri,
        value: FIELD_VALUE_NONE,
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
  const fetching = possibleFiltersFetching || dataFetching;

  const { filterDimensions, addableDimensions } = useMemo(() => {
    const mappedIris = getFieldComponentIris(fields);
    const keysOrder = Object.fromEntries(
      Object.keys(filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      dimensions.filter(
        (dim) => !mappedIris.has(dim.iri) && keysOrder[dim.iri] !== undefined
      ) || [],
      [(x) => keysOrder[x.iri] ?? Infinity]
    );
    const addableDimensions = dimensions.filter(
      (dim) =>
        !mappedIris.has(dim.iri) &&
        keysOrder[dim.iri] === undefined &&
        !isStandardErrorDimension(dim)
    );
    return {
      filterDimensions,
      addableDimensions,
    };
  }, [dimensions, fields, filters]);

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

const useStyles = makeStyles<
  Theme,
  {
    fetching: boolean;
  }
>((theme) => ({
  filterSection: {
    flexGrow: 1,
  },
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
      color: "secondary.active",
    },
    ".buttons:hover": (props) =>
      props.fetching
        ? {}
        : {
            opacity: 1,
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

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
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
  const { fetching: possibleFiltersFetching } = useEnsurePossibleFilters({
    state,
  });
  const fetching = possibleFiltersFetching || dataFetching;

  const filterMenuButtonRef = useRef(null);

  const classes = useStyles({ fetching });

  if (!data?.dataCubeByIri) {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }

  return (
    <>
      <ControlSection>
        <SectionTitle titleId="controls-design">
          <Trans id="controls.section.chart.options">Chart Options</Trans>
        </SectionTitle>
        <ControlSectionContent
          side="left"
          role="tablist"
          aria-labelledby="controls-design"
        >
          <ChartFields
            chartConfig={state.chartConfig}
            metaData={data.dataCubeByIri}
          />
        </ControlSectionContent>
      </ControlSection>
      <ControlSection className={classes.filterSection}>
        <SectionTitle titleId="controls-data">
          <Trans id="controls.section.data.filters">Filters</Trans>{" "}
          {fetching ? (
            <CircularProgress size={12} className={classes.loadingIndicator} />
          ) : null}
        </SectionTitle>

        <ControlSectionContent side="left" aria-labelledby="controls-data">
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
    </>
  );
};

const ChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ChartConfig;
  metaData: DataCubeMetadata;
}) => {
  const { chartType } = chartConfig;
  const { dimensions, measures } = metaData;
  const components = [...dimensions, ...measures];

  return (
    <>
      {chartConfigOptionsUISpec[chartType].encodings.map(({ field }) => {
        const component = components.find(
          (d) => d.iri === (chartConfig.fields as any)[field]?.componentIri
        );

        return isMapConfig(chartConfig) && field === "baseLayer" ? (
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
            component={
              isMapConfig(chartConfig) && field === "symbolLayer"
                ? chartConfig.fields.symbolLayer.show
                  ? component
                  : undefined
                : component
            }
            value={field}
            labelId={`${chartConfig.chartType}.${field}`}
          />
        );
      })}
    </>
  );
};
