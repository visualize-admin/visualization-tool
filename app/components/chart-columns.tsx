import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { useObservations } from "../domain";
import { ColumnConfig, ColumnFields } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Loading } from "./hint";
import { A11yTable } from "./a11y-table";
import { ColumnsSegment } from "./charts-generic/columns-segment";
import { Columns } from "./charts-generic/columns";

export const ChartColumnsVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: ColumnConfig;
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

  const observations = useObservations<ColumnFields>({
    dataSet,
    dimensions,
    measures,
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
        <ChartColumns
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

export const ChartColumns = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: Observations<ColumnFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: ColumnFields;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      {fields.segment ? (
        <ColumnsSegment
          data={observations}
          width={width}
          dimensions={dimensions}
          measures={measures}
          fields={fields}
        />
      ) : (
        <Columns
          data={observations}
          width={width}
          dimensions={dimensions}
          measures={measures}
          fields={fields}
        />
      )}
    </div>
  );
};
