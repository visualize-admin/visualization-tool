import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { isEmpty, isEqual, sortBy } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { CombinedError, useClient } from "urql";

import { getFieldComponentIris } from "@/charts";
import { chartConfigOptionsUISpec } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
  isMapConfig,
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
  moveFilterField,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isStandardErrorDimension } from "@/domain/data";
import {
  DataCubeMetadataWithComponentValuesQuery,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  useDataCubeMetadataWithComponentValuesQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

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
  return (
    <Box sx={{ pl: 2, flexGrow: 1 }}>
      {dimension.__typename === "TemporalDimension" &&
      dimension.timeUnit !== "Day" ? (
        <DataFilterSelectTime
          dimensionIri={dimension.iri}
          label={`${index + 1}. ${dimension.label}`}
          controls={controls}
          from={dimension.values[0].value}
          to={dimension.values[1].value}
          timeUnit={dimension.timeUnit}
          timeFormat={dimension.timeFormat}
          disabled={disabled}
          id={`select-single-filter-${index}`}
          isOptional={!dimension.isKeyDimension}
        />
      ) : null}
      {dimension.__typename === "TemporalDimension" &&
      dimension.timeUnit === "Day" &&
      dimension.values ? (
        <DataFilterSelectDay
          dimensionIri={dimension.iri}
          label={`${index + 1}. ${dimension.label}`}
          controls={controls}
          options={dimension.values}
          disabled={disabled}
          id={`select-single-filter-${index}`}
          isOptional={!dimension.isKeyDimension}
        />
      ) : null}
      {dimension.__typename !== "TemporalDimension" ? (
        <DataFilterSelect
          dimensionIri={dimension.iri}
          label={`${index + 1}. ${dimension.label}`}
          controls={controls}
          options={dimension.values}
          disabled={disabled}
          id={`select-single-filter-${index}`}
          isOptional={!dimension.isKeyDimension}
        />
      ) : null}
    </Box>
  );
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
export const useEnsurePossibleFilters = ({
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
      const {
        data,
        error,
      }: { data?: PossibleFiltersQuery; error?: CombinedError } = await client
        .query(PossibleFiltersDocument, {
          iri: state.dataSet,
          filters: unmappedFilters,
          filterKey: Object.keys(unmappedFilters).join(", "),
        })
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
  ]);
  return { error, fetching };
};

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState();
  const { fields, filters } = state.chartConfig;
  const unmappedFilters = React.useMemo(() => {
    return getFiltersByMappingStatus(fields, filters).unmapped;
  }, [fields, filters]);

  const variables = React.useMemo(
    () => ({
      iri: state.dataSet,
      locale,
      filters: unmappedFilters,
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order
      filterKeys: Object.keys(unmappedFilters).join(", "),
    }),
    [state.dataSet, locale, unmappedFilters]
  );
  const [{ data, fetching: dataFetching }, executeQuery] =
    useDataCubeMetadataWithComponentValuesQuery({
      variables: variables,
    });
  const metaData = data?.dataCubeByIri;

  const handleMove = useCallback(
    (dimensionIri: string, delta: number) => {
      if (!metaData) {
        return;
      }

      const dimension = data?.dataCubeByIri?.dimensions.find(
        (d) => d.iri === dimensionIri
      );
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
    },
    [data?.dataCubeByIri?.dimensions, dispatch, metaData, state.chartConfig]
  );

  useEffect(() => {
    executeQuery({
      variables,
    });
  }, [variables, executeQuery]);

  const { fetching: possibleFiltersFetching } = useEnsurePossibleFilters({
    state,
  });
  const fetching = possibleFiltersFetching || dataFetching;

  const {
    isOpen: isFilterMenuOpen,
    open: openFilterMenu,
    close: closeFilterMenu,
  } = useDisclosure();
  const filterMenuButtonRef = useRef(null);
  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const keysOrder = Object.fromEntries(
      Object.keys(state.chartConfig.filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      data?.dataCubeByIri.dimensions.filter(
        (dim) => !mappedIris.has(dim.iri) && keysOrder[dim.iri] !== undefined
      ),
      [(x) => keysOrder[x.iri] ?? Infinity]
    );
    const addableDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) =>
        !mappedIris.has(dim.iri) &&
        keysOrder[dim.iri] === undefined &&
        !isStandardErrorDimension(dim)
    );

    const handleDragEnd: OnDragEndResponder = (result) => {
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
    };

    const handleAddDimensionFilter = (
      dimension: NonNullable<
        NonNullable<
          DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
        >["dimensions"]
      >[number]
    ) => {
      closeFilterMenu();
      const filterValue = dimension.values[0];
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri: dimension.iri,
          value: filterValue.value,
        },
      });
    };

    const handleRemoveDimensionFilter = (
      dimension: NonNullable<
        NonNullable<
          DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
        >["dimensions"]
      >[number]
    ) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri: dimension.iri,
          value: FIELD_VALUE_NONE,
        },
      });
    };

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
        <ControlSection sx={{ flexGrow: 1 }}>
          <SectionTitle titleId="controls-data">
            <Trans id="controls.section.data.filters">Filters</Trans>{" "}
            {fetching ? (
              <CircularProgress
                size={12}
                sx={{ color: "hint.main", display: "inline-block", ml: 1 }}
              />
            ) : null}
          </SectionTitle>

          <ControlSectionContent side="left" aria-labelledby="controls-data">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="filters">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    sx={{ "& > * + *": { mt: 3 }, mb: 4 }}
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
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "stretch",
                                "& .buttons": {
                                  transition:
                                    "color 0.125s ease, opacity 0.125s ease-out",
                                  opacity: 0.25,
                                  color: "secondary.active",
                                },
                                ".buttons:hover": fetching
                                  ? {}
                                  : {
                                      opacity: 1,
                                    },
                              }}
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
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  flexGrow: 0,
                                  flexShrink: 0,
                                  mb: -1,
                                  ml: 2,
                                }}
                              >
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
                                  onClickUp={() =>
                                    handleMove(dimension.iri, -1)
                                  }
                                  onClickDown={() =>
                                    handleMove(dimension.iri, 1)
                                  }
                                />
                              </Box>
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
              <Box
                sx={{
                  pl: 2,
                  "& .menu-button": {
                    background: "transparent",
                    border: 0,
                    padding: 0,
                  },
                }}
              >
                <Button
                  ref={filterMenuButtonRef}
                  onClick={openFilterMenu}
                  variant="contained"
                  sx={{
                    display: "flex",
                    minWidth: "auto",
                    justifyContent: "center",
                  }}
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
  } else {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }
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
        const isMapChart = isMapConfig(chartConfig);
        const component = components.find(
          (d) => d.iri === (chartConfig.fields as any)[field]?.componentIri
        );

        return isMapChart && field === "baseLayer" ? (
          <OnOffControlTabField
            key={field}
            value={field}
            icon="baseLayer"
            label={<Trans id="chart.map.layers.base">Base Layer</Trans>}
            active={chartConfig.baseLayer.show}
          />
        ) : (
          <ControlTabField
            key={field}
            component={
              isMapChart && field === "symbolLayer"
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
