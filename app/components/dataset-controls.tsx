import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";

import { ChartTypeSelector } from "./settings-chart-type-selector";
import { ChartType } from "../types";
import { ChartBarState } from "./charts-bars-state";
import { ChartLineState } from "./charts-lines-state";

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

  const observations = useObservations({
    dataset,
    namedSelection
  });

  if (observations.state === "loaded") {
    return (
      <>
        <ChartTypeSelector
          chartType={chartType}
          updateChartType={updateChartType}
        />
        {chartType === "bar" && (
          <ChartBarState
            dimensions={dimensions}
            measures={measures}
            observations={observations.data.results}
          />
        )}
        {chartType === "line" && (
          <ChartLineState
            dimensions={dimensions}
            measures={measures}
            observations={observations.data.results}
          />
        )}
      </>
    );
  } else {
    return <div>Loading data...</div>;
  }
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
