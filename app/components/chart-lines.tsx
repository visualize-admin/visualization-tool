import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { LineChartFields, useObservations } from "../domain";
import { Filters } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Lines } from "./charts-generic/lines";
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
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  filters?: Filters;
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
    return <ChartLines observations={observations.data} palette={palette} />;
  } else {
    return <Loading />;
  }
};

export const ChartLines = ({
  observations,
  palette
}: {
  observations: Observations<LineChartFields>;
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef}>
      <Lines
        data={observations}
        width={width}
        xField={"xField"}
        yField="heightField"
        groupBy={"groupByField"}
        groupByLabel={"groupByLabel"}
        aggregateFunction={"sum"}
        palette={palette}
      />
    </div>
  );
};
