import { Trans } from "@lingui/macro";
import { sortBy } from "lodash";
import * as React from "react";
import { useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { Box, Spinner } from "theme-ui";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  useConfiguratorState,
} from "..";
import { getFieldComponentIris } from "../../charts";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import {
  ensureFilterValuesCorrect,
  moveFilterField,
} from "../configurator-state";
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
} from "./field";

const DataFilterSelectGeneric = ({
  dimension,
  index,
  disabled,
}: {
  dimension: DataCubeMetadata["dimensions"][number];
  isOptional?: boolean;
  index: number;
  disabled?: boolean;
}) => {
  const controls = (
    <>
      <button
        style={{
          background: "transparent",
          cursor: "pointer",
          color: "#666",
          border: "transparent",
        }}
        onClick={() => onMove(-1)}
      >
        ▲
      </button>
      <button
        style={{
          background: "transparent",
          cursor: "pointer",
          color: "#666",
          border: "transparent",
        }}
        onClick={() => onMove(1)}
      >
        ▼
      </button>
    </>
  );
  return (
    <Box sx={{ px: 2, mb: 2, flexGrow: 1 }}>
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

const MoveAndDragButtons = ({
  onClickUp,
  onClickDown,
  className,
}: {
  onClickUp: () => void;
  onClickDown: () => void;
  className?: string;
}) => {
  return (
    <>
      <Button className={className} variant="arrow" onClick={onClickUp}>
        ▲
      </Button>
      <Icon
        className={className}
        color="#ddd"
        name="dragndrop2"
        style={{ flexShrink: 0, cursor: "move" }}
      />
      <Button className={className} variant="arrow" onClick={onClickDown}>
        ▼
      </Button>
    </>
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
      date: new Date(),
      iri: state.dataSet,
      locale,
      filters: state.chartConfig.filters,
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

  React.useEffect(() => {
    executeQuery({
      requestPolicy: "network-only",
      variables,
    });
  }, [variables, executeQuery]);

  React.useEffect(() => {
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
      data?.dataCubeByIri.dimensions.filter((dim) => !mappedIris.has(dim.iri)),
      [(x) => keysOrder[x.iri] ?? Infinity]
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
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  pt: 5,
                                }}
                              >
                                <MoveAndDragButtons
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
        const encodingField = encoding.field;

        return (
          <ControlTabField
            key={encoding.field}
            component={components.find(
              (d) =>
                d.iri ===
                (chartConfig.fields as any)[encodingField]?.componentIri
            )}
            value={encoding.field}
            labelId={`${chartConfig.chartType}.${encoding.field}`}
          />
        );
      })}
    </>
  );
};
