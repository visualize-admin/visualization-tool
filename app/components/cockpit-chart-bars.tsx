import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations } from "../domain/data-cube";
import { ChartBars } from "./charts-bars";
import { Field } from "./field";
import { Loading } from "./hint";

export const ChartBarsControls = ({
  chartId,
  timeDimensions,
  categoricalDimensions,
  measuresDimensions
}: {
  chartId: string;
  timeDimensions: Dimension[];
  categoricalDimensions: Dimension[];
  measuresDimensions: Dimension[];
}) => {
  return (
    <>
      <h5>X Axis (Categories)</h5>
      {categoricalDimensions.map(cd => (
        <Field
          key={cd.iri.value}
          type="radio"
          chartId={chartId}
          path={"x"}
          label={cd.labels[0].value}
          value={cd.iri.value}
        />
      ))}
      <h5>Y Axis (Values)</h5>
      {measuresDimensions.map(md => (
        <Field
          key={md.iri.value}
          type="radio"
          chartId={chartId}
          path={"height"}
          label={md.labels[0].value}
          value={md.iri.value}
        />
      ))}
      <h5>Color (Categories)</h5>
      {categoricalDimensions.map(cd => (
        <Field
          key={`color-${cd.iri.value}`}
          type="radio"
          chartId={chartId}
          path={"color"}
          label={cd.labels[0].value}
          value={cd.iri.value}
        />
      ))}
    </>
  );
};

export const ChartBarsVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  xField,
  groupByField,
  heightField
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  const observations = useObservations({
    dataSet,
    measures,
    dimensions,
    xField,
    groupByField,
    heightField,
    filters
  });

  if (observations.state === "loaded") {
    console.log({ observations });
    console.log({ dimensions });

    return (
      <ChartBars
        observations={observations.data.results}
        dimensions={dimensions}
        measures={measures}
        xField={xField}
        groupByField={groupByField}
        heightField={heightField}
        aggregationFunction={"sum"}
      />
    );
  } else {
    return <Loading>Updating data...</Loading>;
  }
};
