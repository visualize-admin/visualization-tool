import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  formatDataForAreaChart,
  getDimensionLabelFromIri,
  useObservations,
  AreaChartFields
} from "../domain";
import { Areas } from "./charts-generic/areas";
import { useResizeObserver } from "../lib/use-resize-observer";
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
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
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
      <ChartAreas
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

export const ChartAreas = ({
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
  fields: AreaChartFields;

  aggregationFunction: "sum";
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForAreaChart({
    observations,
    dimensions,
    measures,
    fields
  });
  return (
    <div ref={resizeRef}>
      <Areas
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
