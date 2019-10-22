import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForBarChart, getDimensionLabelFromIri } from "../domain";
import { Bars } from "./charts-generic/bars";
import { useResizeObserver } from "../lib/use-resize-observer";

export const ChartBars = ({
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
  const formattedData = formatDataForBarChart({
    observations,
    dimensions,
    measures,
    xField,
    groupByField,
    heightField
  });

  return (
    <div ref={resizeRef}>
      <Bars
        data={formattedData}
        width={width}
        xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
        heightField="measure"
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
