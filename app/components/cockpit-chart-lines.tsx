import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations } from "../domain/data-cube";
import { ChartLines } from "./charts-lines";
import { Field } from "./field";
import { Loading } from "./hint";
import { ControlList, ControlSection } from "./chart-controls";

export const ChartLinesControls = ({
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
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
          {timeDimensions.map(td => (
            <Field
              key={td.iri.value}
              type="radio"
              chartId={chartId}
              path={"x"}
              label={td.labels[0].value}
              value={td.iri.value}
            />
          ))}
        </ControlList>
      </ControlSection>
      <ControlSection title="Vertikale Achse" note="y-Achse">
        <ControlList>
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
        </ControlList>
      </ControlSection>
      <ControlSection title="Farbe">
        <ControlList>
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
        </ControlList>
      </ControlSection>
    </>
  );
};

export const ChartLinesVisualization = ({
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
    heightField,
    groupByField,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <ChartLines
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
