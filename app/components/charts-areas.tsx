import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForAreaChart, getDimensionLabelFromIri } from "../domain";
import { Areas } from "./charts-generic/areas";
import { useResizeObserver } from "../lib/use-resize-observer";

export const ChartAreas = ({
  observations,
  dimensions,
  measures,
  xField,
  groupByField,
  heightField,
  aggregationFunction,
  palette
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];
  xField: string;
  groupByField: string;
  heightField: string;
  aggregationFunction: "sum";
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForAreaChart({
    observations,
    dimensions,
    measures,
    xField,
    groupByField,
    heightField
  });
  return (
    <div ref={resizeRef}>
      <Areas
        data={formattedData}
        width={width}
        xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
        yField="measure"
        groupBy={getDimensionLabelFromIri({
          dimensionIri: groupByField,
          dimensions
        })}
        groupByLabel={getDimensionLabelFromIri({
          dimensionIri: groupByField,
          dimensions
        })}
        aggregateFunction={aggregationFunction}
        palette={palette}
      />
    </div>
  );
};
