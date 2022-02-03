import { t, Trans } from "@lingui/macro";
import { Menu, MenuButton, MenuItem, MenuList } from "@reach/menu-button";
import { sortBy } from "lodash";
import * as React from "react";
import { useCallback, useEffect } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { Box, Button, Spinner } from "theme-ui";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  isMapConfig,
  useConfiguratorState,
} from "..";
import { getFieldComponentIris } from "../../charts";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
import { Loading } from "../../components/hint";
import {
  DataCubeMetadataWithComponentValuesQuery,
  useDataCubeMetadataWithComponentValuesQuery,
} from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import {
  ensureFilterValuesCorrect,
  moveFilterField,
} from "../configurator-state";
import { FIELD_VALUE_NONE } from "../constants";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import {
  ControlTabField,
  DataFilterSelect,
  DataFilterSelectDay,
  DataFilterSelectTime,
  OnOffControlTabField,
} from "./field";
import MoveDragButtons from "./move-drag-buttons";

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
    <Box sx={{ flexGrow: 1 }}>
      <Button
        className="buttons"
        sx={{ ml: 2 }}
        variant="inline"
        onClick={onRemove}
      >
        <Icon
          name="trash"
          style={{ fontSize: "small !important" }}
          width="16"
          height="16"
        />
      </Button>
    </Box>
  );
  return (
    <Box sx={{ pl: 2, mb: 2, flexGrow: 1 }}>
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

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState();
  const variables = React.useMemo(
    () => ({
      iri: state.dataSet,
      locale,
      filters: state.chartConfig.filters,
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order
      filterKeys: Object.keys(state.chartConfig.filters).join(", "),
    }),
    [state, locale]
  );
  const [{ data, fetching }, executeQuery] =
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

  useEffect(() => {
    if (!metaData || !data || !data.dataCubeByIri) {
      return;
    }
    // Make sure that the filters are in line with the values
    const chartConfig = ensureFilterValuesCorrect(state.chartConfig, {
      dimensions: data.dataCubeByIri.dimensions,
    });

    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig,
        dataSetMetadata: metaData,
      },
    });
  }, [data, dispatch, metaData, state.chartConfig]);

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
      (dim) => !mappedIris.has(dim.iri) && keysOrder[dim.iri] === undefined
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
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri: dimension.iri,
          value: dimension.values[0],
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
              <Spinner size={12} sx={{ display: "inline-block" }} />
            ) : null}
          </SectionTitle>

          <ControlSectionContent side="left" aria-labelledby="controls-data">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="filters">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {filterDimensions.map((dimension, i) => (
                      <Draggable
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
                                  color: "secondaryActive",
                                },
                                ".buttons:hover": {
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
                                  pb: 3,
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
                  </div>
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
                <Menu>
                  <MenuButton className="menu-button">
                    <Button
                      variant="primary"
                      sx={{
                        display: "flex",
                        minWidth: "auto",
                        justifyContent: "center",
                      }}
                    >
                      <Trans>Add filter</Trans>
                      <Icon name="add" height={18} />
                    </Button>
                  </MenuButton>
                  <MenuList>
                    {addableDimensions.map((dim) => (
                      <MenuItem
                        onSelect={() => handleAddDimensionFilter(dim)}
                        key={dim.iri}
                      >
                        {dim.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            ) : null}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  } else {
    return <Loading />;
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
      {chartConfigOptionsUISpec[chartType].encodings.map((encoding) => {
        return isMapConfig(chartConfig) && encoding.field === "baseLayer" ? (
          <OnOffControlTabField
            value={encoding.field}
            icon="baseLayer"
            label={<Trans id="chart.map.layers.base">Base Layer</Trans>}
            active={
              chartConfig.baseLayer.showRelief ||
              chartConfig.baseLayer.showWater
            }
          />
        ) : (
          <ControlTabField
            key={encoding.field}
            component={components.find(
              (d) =>
                d.iri ===
                (chartConfig.fields as any)[encoding.field]?.componentIri
            )}
            value={encoding.field}
            labelId={`${chartConfig.chartType}.${encoding.field}`}
          />
        );
      })}
    </>
  );
};
