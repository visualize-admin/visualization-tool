import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations2 } from "../domain/data-cube";
import { Field } from "./field";
import { Loading } from "./hint";
import { ControlSection, ControlList } from "./chart-controls";
import { ChartScatterplot } from "./charts-scatterplot";

export const ChartScatterplotControls = ({
  chartId,
  measuresDimensions
}: {
  chartId: string;
  measuresDimensions: Dimension[];
}) => {
  return (
    <>
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"x"}
            label={"Werte wählen"}
            options={measuresDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Vertikale Achse" note="y-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"y"}
            label={"Werte wählen"}
            options={measuresDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
    </>
  );
};

export const ChartScatterplotVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  xField,
  yField
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  xField: string;
  yField: string;
}) => {
  const fields = React.useMemo(
    () => new Map([["xField", xField], ["yField", yField]]),
    [xField, yField]
  );

  const observations = useObservations2({
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
        xField={xField}
        yField={yField}
      />
    );
  } else {
    return <Loading>Updating data...</Loading>;
  }
};
