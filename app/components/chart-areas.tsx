import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { useObservations } from "../domain";
import { AreaFields, AreaConfig, FieldType } from "../domain/config-types";
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
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: AreaConfig;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    const fieldIris = new Set(
      Object.values<FieldType>(chartConfig.fields).map(f => f.componentIri)
    );
    const restDimensions = dimensions.reduce<{ [k: string]: FieldType }>(
      (acc, d, i) => {
        if (!fieldIris.has(d.component.iri.value)) {
          acc[`dim${i}`] = { componentIri: d.component.iri.value };
        }
        return acc;
      },
      {}
    );

    return { ...restDimensions, ...chartConfig.fields };
  }, [chartConfig, dimensions]);

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
          fields={allFields}
          observations={observations.data}
        />
        <ChartAreas
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

export const ChartAreas = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: Observations<AreaFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: AreaFields;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      <Areas
        data={observations}
        width={width}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
      />
    </div>
  );
};
