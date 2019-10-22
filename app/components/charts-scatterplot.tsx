import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForScatterplot, getMeasureLabelFromIri } from "../domain";
import { Scatterplot } from "./charts-generic/scatterplot";
import { useResizeObserver } from "../lib/use-resize-observer";

export const ChartScatterplot = ({
  observations,
  dimensions,
  measures,
  xField,
  yField
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];
  xField: string;
  yField: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForScatterplot({
    observations,
    dimensions,
    measures,
    xField,
    yField
  });
  return (
    <div ref={resizeRef}>
      <Scatterplot
        data={formattedData}
        width={width}
        xField={getMeasureLabelFromIri({ measureIri: xField, measures })}
        yField={getMeasureLabelFromIri({ measureIri: yField, measures })}
      />
    </div>
  );
};
