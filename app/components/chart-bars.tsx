import { Dimension, DataCube, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getDimensionLabelFromIri,
  useObservations,
  formatDataForBarChart,
  BarChartFields
} from "../domain";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Bars } from "./charts-generic/bars";
import { Loading } from "./hint";

export const ChartBarsVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  fields,
  palette
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  fields: BarChartFields;
  palette: string;
}) => {
  const observations = useObservations({
    dataSet,
    measures,
    dimensions,
    fields,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <ChartBars
        observations={observations.data.results}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
        aggregationFunction={"sum"}
        palette={palette}
      />
    );
  } else {
    return <Loading />;
  }
};

export const ChartBars = ({
  observations,
  dimensions,
  measures,
  fields,
  aggregationFunction,
  palette
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];
  fields: BarChartFields;
  aggregationFunction: "sum";
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();
  const formattedData = formatDataForBarChart({
    observations,
    dimensions,
    measures,
    fields
  });
  return (
    <div ref={resizeRef}>
      <Bars
        data={formattedData}
        width={width}
        xField={getDimensionLabelFromIri({
          dimensionIri: fields.xField,
          dimensions
        })}
        heightField="measure"
        groupBy={getDimensionLabelFromIri({
          dimensionIri: fields.groupByField,
          dimensions
        })}
        aggregateFunction={aggregationFunction}
        palette={palette}
      />
    </div>
  );
};
