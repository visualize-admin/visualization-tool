import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getCategoricalDimensions,
  getMeasuresDimensions,
  getTimeDimensions,
  useDataSetMetadata,
  useFilteredObservations
} from "../domain/data-cube";
import { Field } from "./field";
import { useConfiguratorState } from "../domain/configurator-state";
import { Box, Flex } from "rebass";
import { ChartLines } from "./charts-lines";
import { Filters } from "./cockpit-filters";

export const CockpitChartLines = ({
  chartId,
  dataset
}: {
  chartId: string;
  dataset: DataCube;
}) => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  const meta = useDataSetMetadata(dataset);

  if (meta.state === "loaded") {
    const { dimensions, measures } = meta.data;

    const timeDimensions = getTimeDimensions({ dimensions });
    const categoricalDimensions = getCategoricalDimensions({ dimensions });
    const measuresDimensions = getMeasuresDimensions({ dimensions });

    return (
      <>
        <Flex>
          <Box width={1 / 3} px={2}>
            <h5>X Axis (Time)</h5>
            {timeDimensions.map(td => (
              <Field
                key={td.iri.value}
                type="radio"
                chartId={chartId}
                path={"x"}
                label={td.labels[0].value}
                value={td.iri.value}
              />
            ))}
            <h5>Y Axis (Values)</h5>
            {measuresDimensions.map(md => (
              <Field
                key={md.iri.value}
                type="radio"
                chartId={chartId}
                path={"height"}
                label={md.labels[0].value}
                value={md.iri.value}
              />
            ))}
            <h5>Color (Categories)</h5>
            {categoricalDimensions.map(cd => (
              <Field
                key={cd.iri.value}
                type="radio"
                chartId={chartId}
                path={"color"}
                label={cd.labels[0].value}
                value={cd.iri.value}
              />
            ))}
          </Box>
          <Box width={1 / 3} px={2}>
            <Filters
              chartId={chartId}
              dataset={dataset}
              dimensions={categoricalDimensions}
            />
          </Box>
        </Flex>
        {state.state === "CONFIGURING_CHART" && (
          <Box width={1 / 3} px={2}>
            <Visualization
              dataset={dataset}
              dimensions={dimensions}
              measures={measures}
              // filters={"filters"}
              xField={state.chartConfig.x}
              groupByField={state.chartConfig.color}
              heightField={state.chartConfig.height}
            />
          </Box>
        )}
      </>
    );
  } else {
    return <div>Loading metadata</div>;
  }
};

const Visualization = ({
  dataset,
  dimensions,
  measures,
  filters,
  xField,
  groupByField,
  heightField
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: Map<Dimension, string[]>;
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  const observations = useFilteredObservations({
    dataset,
    measures,
    dimensions,
    xField,
    heightField,
    groupByField,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <ChartLines
        observations={observations.data.results}
        xField={xField}
        groupByField={groupByField}
        heightField={heightField}
        aggregationFunction={"sum"}
      />
    );
  } else {
    return <div>Updating data...</div>;
  }
};
