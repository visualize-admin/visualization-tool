import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations, BarChartFields } from "../domain";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Bars } from "./charts-generic/bars";
import { Loading } from "./hint";
import { Filters } from "../domain/config-types";

export const ChartBarsVisualization = ({
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
  fields: BarChartFields;
  palette: string;
}) => {
  const observations = useObservations<BarChartFields>({
    dataSet,
    measures,
    dimensions,
    fields,
    filters
  });

  if (observations.state === "loaded") {
    console.log(observations.data);

    // const formattedData = formatDataForBarChart({
    //   observations: observations.data.results,
    //   dimensions,
    //   measures,
    //   fields
    // });

    return <ChartBars observations={observations.data} palette={palette} />;
  } else {
    return <Loading />;
  }
};

export const ChartBars = ({
  observations,
  palette
}: {
  observations: Observations<BarChartFields>;
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef}>
      <Bars
        data={observations}
        width={width}
        xField={"xField"}
        heightField="heightField"
        groupBy={"groupByField"}
        aggregateFunction={"sum"}
        palette={palette}
      />
    </div>
  );
};
