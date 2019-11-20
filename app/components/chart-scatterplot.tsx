import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { useObservations, ScatterPlotFields } from "../domain";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { Scatterplot } from "./charts-generic/scatterplot";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Loading } from "./hint";
import { ScatterPlotConfig } from "../domain/config-types";
import { A11yTable } from "./a11y-table";

export const ChartScatterplotVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: ScatterPlotConfig;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    // debugger;
    const fieldIris = new Set(
      Object.values<{ componentIri: string }>(chartConfig.fields).map(
        d => d.componentIri
      )
    );
    const restDimensions = dimensions.reduce<{
      [k: string]: { componentIri: string };
    }>((acc, d, i) => {
      if (!fieldIris.has(d.component.iri.value)) {
        acc[`dim${i}`] = { componentIri: d.component.iri.value };
      }
      return acc;
    }, {});
    return { ...restDimensions, ...chartConfig.fields };
  }, [chartConfig.fields, dimensions]);

  const observations = useObservations({
    dataSet,
    measures,
    dimensions,
    fields: allFields,
    filters: chartConfig.filters
  });

  if (observations.state === "loaded") {
    return (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          observations={observations.data}
        />
        <ChartScatterplot
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
        />
      </>
    );
  } else {
    return <Loading />;
  }
};

export const ChartScatterplot = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: Observations<ScatterPlotFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: ScatterPlotFields;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      <Scatterplot
        data={observations}
        width={width}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
      />
    </div>
  );
};
