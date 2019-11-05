import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations, ScatterPlotFields } from "../domain";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { Scatterplot } from "./charts-generic/scatterplot";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Loading } from "./hint";
import { Filters } from "../domain/config-types";

export const ChartScatterplotVisualization = ({
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
  fields: ScatterPlotFields;

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
      <ChartScatterplot observations={observations.data} palette={palette} />
    );
  } else {
    return <Loading />;
  }
};

export const ChartScatterplot = ({
  observations,

  palette
}: {
  observations: Observations<ScatterPlotFields>;

  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef}>
      <Scatterplot
        data={observations}
        width={width}
        xField={"xField"}
        yField={"yField"}
        groupByField={"groupByField"}
        labelField={"labelField"}
        palette={palette}
      />
    </div>
  );
};
