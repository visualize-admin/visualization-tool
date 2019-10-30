import React from "react";
import {
  formatDataForLineChart,
  getDimensionLabelFromIri,
  useObservations,
  LineChartFields
} from "../domain";
import { Lines } from "./charts-generic/lines";
import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Loading } from "./hint";

export const ChartLinesVisualization = ({
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
  fields: LineChartFields;
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
      <ChartLines
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

export const ChartLines = ({
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
  fields: LineChartFields;
  aggregationFunction: "sum";
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForLineChart({
    observations,
    dimensions,
    measures,
    fields
  });
  return (
    <div ref={resizeRef}>
      <Lines
        data={formattedData}
        width={width}
        xField={getDimensionLabelFromIri({
          dimensionIri: fields.xField,
          dimensions
        })}
        yField="measure"
        groupBy={getDimensionLabelFromIri({
          dimensionIri: fields.groupByField,
          dimensions
        })}
        groupByLabel={getDimensionLabelFromIri({
          dimensionIri: fields.groupByField,
          dimensions
        })}
        aggregateFunction={aggregationFunction}
        palette={palette}
      />
    </div>
  );
};
