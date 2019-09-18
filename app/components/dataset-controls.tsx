import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";

// import { DSBars } from "./chart-bars";
import { DSDimensionSelect } from "./settings-dimension-select";
import { DSFilter } from "./settings-dimension-filter";
import { ChartTypeSelector } from "./settings-chart-type-selector";
import { ChartType } from "../types";
import { Flex, Box } from "rebass";
import { ChartBars } from "./chart-bars";

const Cockpit = ({
  dataset,
  dimensions,
  measures,
  namedDimensions,
  namedSelection
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  namedDimensions: (string | Dimension)[][];
  namedSelection: any;
}) => {
  const [chartType, updateChartType] = useState("bar" as ChartType);
  const [dimensionFilter, addDimensionFilter] = useState({}); // {dimension: dimensionValue[]}

  const [xAxisField, updateXAxisField] = useState(dimensions[0]);
  const [heightField, updateHeightField] = useState(measures[0]);

  const observations = useObservations({
    dataset,
    namedSelection
  });

  return observations.state === "loaded" ? (
    <>
      <ChartTypeSelector
        chartType={chartType}
        updateChartType={updateChartType}
      />
      <Flex>
        <Box width={1 / 3} px={2}>
          <DSDimensionSelect
            dimensions={dimensions}
            selectedDimension={xAxisField}
            updateDimension={updateXAxisField}
          />
          <DSFilter
            observations={observations.data}
            namedDimensions={namedDimensions}
          />
        </Box>
        <Box width={1 / 3} px={2}>
          <ChartBars
            observations={observations.data.results}
            xAxisField={xAxisField}
            heightField={heightField}
            aggregationFunction={"sum"}
          />
        </Box>
      </Flex>
    </>
  ) : null;
};

export const DSControls = ({ dataset }: { dataset: DataCube }) => {
  const meta = useDataSetMetadata(dataset);
  if (meta.state === "loaded") {
    const namedDimensions = meta.data.dimensions.map(dim => {
      const key = dim.labels[0].value;
      return [key, dim];
    });
    const namedSelection = {
      measure: meta.data.measures[0],
      ...Object.fromEntries(namedDimensions)
    };
    console.log({ namedDimensions });
    console.log({ namedSelection });

    return (
      <>
        <Cockpit
          dataset={dataset}
          dimensions={meta.data.dimensions}
          measures={meta.data.measures}
          namedDimensions={namedDimensions}
          namedSelection={namedSelection}
        />
      </>
    );
  } else {
    return <div>Loading metadata</div>;
  }
};
