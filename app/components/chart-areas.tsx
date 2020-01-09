import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { useObservations } from "../domain";
import { AreaConfig, AreaFields, FieldType } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { A11yTable } from "./a11y-table";
import { Areas } from "./charts-generic/areas";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";

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

  const { data: observations } = useObservations({
    dataSet,
    measures,
    dimensions,
    fields: allFields,
    filters: chartConfig.filters
  });

  if (observations) {
    return observations.length > 0 ? (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        />
        <ChartAreas
          observations={observations}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
        />
        <DataDownload
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        />
      </>
    ) : (
      <NoDataHint />
    );
  } else {
    return <Loading />;
  }
};

export const ChartAreas = memo(
  ({
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
  }
);
