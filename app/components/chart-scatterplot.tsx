import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  formatDataForScatterplot,
  getMeasureLabelFromIri,
  getDimensionLabelFromIri,
  Fields,
  ScatterplotFieldKey,
  useObservations
} from "../domain";
import { Scatterplot } from "./charts-generic/scatterplot";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Loading } from "./hint";

export const ChartScatterplotVisualization = ({
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
  fields: Fields<ScatterplotFieldKey>;

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
      <ChartScatterplot
        observations={observations.data.results}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
        palette={palette}
      />
    );
  } else {
    return <Loading />;
  }
};

export const ChartScatterplot = ({
  observations,
  dimensions,
  measures,
  fields,
  palette
}: {
  observations: any[];
  dimensions: Dimension[];
  measures: Measure[];
  fields: Fields<ScatterplotFieldKey>;
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  const formattedData = formatDataForScatterplot({
    observations,
    dimensions,
    measures,
    fields
  });
  return (
    <div ref={resizeRef}>
      <Scatterplot
        data={formattedData}
        width={width}
        xField={getMeasureLabelFromIri({
          measureIri: fields.get("xField")!,
          measures
        })}
        yField={getMeasureLabelFromIri({
          measureIri: fields.get("yField")!,
          measures
        })}
        groupByField={getDimensionLabelFromIri({
          dimensionIri: fields.get("groupByField")!,
          dimensions
        })}
        labelField={getDimensionLabelFromIri({
          dimensionIri: fields.get("labelField")!,
          dimensions
        })}
        palette={palette}
      />
    </div>
  );
};
