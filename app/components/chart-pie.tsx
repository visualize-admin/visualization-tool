import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { PieFields, useObservations } from "../domain";
import { PieConfig } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";

import { A11yTable } from "./a11y-table";
import { Pie } from "./charts-generic/pie";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { Chart } from "./charts-generic/chart-state";
import { Tooltip } from "./charts-generic/tooltip";

export const ChartPieVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: PieConfig;
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
          fields={chartConfig.fields}
          observations={observations}
        />
        <ChartPie
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

export const ChartPie = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
    fields: PieFields;
  }) => {
    return (
      <Chart>
        <Pie
          data={observations}
          dimensions={dimensions}
          measures={measures}
          fields={fields}
        />
        <Tooltip />
      </Chart>
    );
  }
);
