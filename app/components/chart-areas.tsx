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
import { A11yTable } from "./a11y-table";

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
    return (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={fields}
          observations={observations.data}
        />
        <ChartAreas observations={observations.data} palette={palette} />
      </>
    );
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
    <div ref={resizeRef} aria-hidden="true">
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
