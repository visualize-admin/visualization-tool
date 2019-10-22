import React from "react";
import { formatDataForLineChart, getDimensionLabelFromIri } from "../domain";
import { Lines } from "./charts-generic/lines";
import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import { useResizeObserver } from "../lib/use-resize-observer";

export const ChartLines = ({
  observations,
  dimensions,
  measures,
  xField,
  groupByField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];
  xField: string;
  groupByField: string;
  heightField: string;
  aggregationFunction: "sum";
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForLineChart({
    observations,
    dimensions,
    measures,
    xField,
    groupByField,
    heightField
  });
  return (
    <div ref={resizeRef}>
      <Lines
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
      />
    </div>
  );
};
