import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { getFieldComponentIris, useObservations } from "../domain";
import { AreaConfig, AreaFields, GenericField } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
import { isNumber } from "../domain/helpers";
import { A11yTable } from "./a11y-table";
import { Areas, Interaction } from "./charts-generic/areas";
import { AxisTime } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";

import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { AreaChart } from "./charts-generic/areas/areas-state";
import { Ruler } from "./charts-generic/annotations";

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

  if (observations && observations.map(obs => obs.y).some(isNumber)) {
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
  } else if (observations && !observations.map(obs => obs.y).some(isNumber)) {
    return <NoDataHint />;
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
    observations: Observation[];
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
    fields: AreaFields;
  }) => {
    return (
      <AreaChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime />
            <AxisHeightLinear />
            <Areas />
          </ChartSvg>
        </ChartContainer>
        {fields.segment && <LegendColor symbol="square" />}
      </AreaChart>
    );
  }
);
