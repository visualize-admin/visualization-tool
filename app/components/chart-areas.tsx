import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { AreaChartFields, useObservations } from "../domain";
import { Filters } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Areas } from "./charts-generic/areas";
import { Loading } from "./hint";
import { A11yTable } from "./a11y-table";

export const ChartAreasVisualization = ({
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
  filters?: Filters;
  fields: AreaChartFields;

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
    fields: allFields,
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
        <ChartAreas
          observations={observations.data}
          palette={palette}
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

export const ChartAreas = ({
  observations,
  dimensions,
  measures,
  palette,
  fields
}: {
  observations: Observations<AreaChartFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  palette: string;
  fields: AreaChartFields;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      <Areas
        data={observations}
        width={width}
        xField={"xField"}
        yField="heightField"
        groupBy={"groupByField"}
        groupByLabel={"groupByLabel"}
        aggregateFunction={"sum"}
        palette={palette}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
      />
    </div>
  );
};
