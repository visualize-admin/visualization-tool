import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations } from "../domain/data-cube";
import { ChartBars } from "./charts-bars";
import { Field } from "./field";
import { Loading } from "./hint";
import { ControlList, ControlSection, ColorPalette } from "./chart-controls";

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
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"x"}
            label={"Dimension wählen"}
            options={categoricalDimensions.map(dim => ({
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
            path={"height"}
            label={"Werte wählen"}
            options={measuresDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Farbe">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"color"}
            label={"Dimension wählen"}
            options={categoricalDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Darstellung">
        <ControlList>
          <ColorPalette
            type="select"
            chartId={chartId}
            path={"palette"}
            label={"Farbpalette:"}
          />
        </ControlList>
      </ControlSection>
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
  heightField,
  palette
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  xField: string;
  groupByField: string;
  heightField: string;
  palette: string;
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
    return (
      <ChartBars
        observations={observations.data.results}
        dimensions={dimensions}
        measures={measures}
        xField={xField}
        groupByField={groupByField}
        heightField={heightField}
        aggregationFunction={"sum"}
        palette={palette}
      />
    );
  } else {
    return <Loading />;
  }
};
