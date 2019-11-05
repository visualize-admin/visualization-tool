import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { AreaChartFields, useObservations } from "../domain";
import { Filters } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Areas } from "./charts-generic/areas";
import { Loading } from "./hint";

export const ChartAreasVisualization = ({
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
  fields: AreaChartFields;

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
    return <ChartAreas observations={observations.data} palette={palette} />;
  } else {
    return <Loading />;
  }
};

export const ChartAreas = ({
  observations,
  palette
}: {
  observations: Observations<AreaChartFields>;
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef}>
      <Areas
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
