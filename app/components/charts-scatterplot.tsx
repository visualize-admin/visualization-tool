import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForScatterplot, getMeasureLabelFromIri } from "../domain";
import { Scatterplot } from "./charts-generic/scatterplot";

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
  const formattedData = formatDataForScatterplot({
    observations,
    dimensions,
    measures,
    xField,
    yField
  });
  return (
    <Scatterplot
      data={formattedData}
      width={600}
      xField={getMeasureLabelFromIri({ measureIri: xField, measures })}
      yField={getMeasureLabelFromIri({ measureIri: yField, measures })}
    />
  );
};
