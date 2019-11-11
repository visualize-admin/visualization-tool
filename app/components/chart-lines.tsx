import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { LineChartFields, useObservations } from "../domain";
import { Filters } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Lines } from "./charts-generic/lines";
import { Loading } from "./hint";
import { A11yTable } from "./a11y-table";

export const ChartLinesVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  fields,
  palette
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: LineChartFields;
  filters?: Filters;
  palette: string;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    const fieldIris = new Set(Object.values(fields));
    const restDimensions = dimensions.reduce<{ [k: string]: string }>(
      (acc, d, i) => {
        if (!fieldIris.has(d.component.iri.value)) {
          acc[`dim${i}`] = d.component.iri.value;
        }
        return acc;
      },
      {}
    );

    return { ...restDimensions, ...fields };
  }, [fields, dimensions]);

  const observations = useObservations({
    dataSet,
    measures,
    dimensions,
    fields:allFields,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations.data}
        />
        <ChartLines
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          palette={palette}
        />
      </>
    );
  } else {
    return <Loading />;
  }
};

export const ChartLines = ({
  observations,
  dimensions,
  measures,
  fields,
  palette
}: {
  observations: Observations<LineChartFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: LineChartFields;
  palette: string;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      <Lines
        data={observations}
        width={width}
        xField={"xField"}
        yField="heightField"
        groupBy={"groupByField"}
        groupByLabel={"groupByLabel"}
        aggregateFunction={"sum"}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
        palette={palette}
      />
    </div>
  );
};
