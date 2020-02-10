import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { getFieldComponentIris, useObservations } from "../domain";
import { GenericField, LineConfig, LineFields } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
import { isNumber } from "../domain/helpers";
import { A11yTable } from "./a11y-table";
import { Ruler, Tooltip } from "./charts-generic/annotations";
import { AxisTime } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";
import {
  InteractionRuler,
  InteractionTooltip,
  Lines
} from "./charts-generic/lines";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { LineChart } from "./charts-generic/lines/lines-state";

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
  } else if (observations && !observations.map(obs => obs.y).some(isNumber)) {
    return <NoDataHint />;
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
    return (
      <LineChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisTime />
            <Lines />
            {/* {fields.segment ? <InteractionRuler /> : <InteractionTooltip />} */}
          </ChartSvg>
          {/* {fields.segment ? <Ruler /> : <Tooltip />} */}
        </ChartContainer>

        {fields.segment && <LegendColor symbol="line" />}
      </LineChart>
    );
  }
);
