import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { getFieldComponentIris, useObservations } from "../domain";
import { GenericField, LineConfig, LineFields } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
import { A11yTable } from "./a11y-table";
import {
  Chart,
  Lines,
  AxisTime,
  AxisLinearHeight,
  Interaction,
  Tooltip,
  ChartSvg,
  Legend,
  ChartContainer
} from "./charts-generic";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { isNumber } from "../domain/helpers";

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
      <Chart aspectRatio={0.4}>
        <ChartContainer>
          <ChartSvg>
            <AxisTime data={observations} field="x" />
            <AxisLinearHeight
              data={observations}
              field="y"
              measures={measures}
              fields={fields}
            />
            <Lines data={observations} fields={fields} />
            <Interaction data={observations} fields={fields} />
          </ChartSvg>
          {/* <Tooltip /> */}
        </ChartContainer>

        {fields.segment && <Legend data={observations} fields={fields} />}
      </Chart>
    );
  }
);
