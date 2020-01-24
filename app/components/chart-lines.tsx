import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { useObservations, getFieldComponentIris } from "../domain";
import { GenericField, LineConfig, LineFields } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { A11yTable } from "./a11y-table";
import { Lines } from "./charts-generic/lines";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";

export const ChartLinesVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: LineConfig;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    const fieldIris = getFieldComponentIris(chartConfig.fields);
    const restDimensions = dimensions.reduce<{ [k: string]: GenericField }>(
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
        <ChartLines
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

export const ChartLines = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
    fields: LineFields;
  }) => {
    const [resizeRef, width] = useResizeObserver<HTMLDivElement>();

    return (
      <div ref={resizeRef} aria-hidden="true">
        <Lines
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
