import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import {
  getFieldComponentIris,
  ScatterPlotFields,
  useObservations
} from "../domain";
import { ScatterPlotConfig } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
import { isNumber } from "../domain/helpers";
import { A11yTable } from "./a11y-table";
import { Tooltip } from "./charts-generic/annotations";
import { AxisWidthLinear } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";
import { Interaction, Scatterplot } from "./charts-generic/scatterplot";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { ScatterplotChart } from "./charts-generic/scatterplot/scatterplot-state";

export const ChartScatterplotVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: ScatterPlotConfig;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    const fieldIris = getFieldComponentIris(chartConfig.fields);
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

  if (
    observations &&
    observations.map(obs => obs.x).some(isNumber) &&
    observations.map(obs => obs.y).some(isNumber)
  ) {
    return observations.length > 0 ? (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          observations={observations}
        />
        <ChartScatterplot
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
  } else if (
    (observations && !observations.map(obs => obs.x).some(isNumber)) ||
    (observations && !observations.map(obs => obs.y).some(isNumber))
  ) {
    return <NoDataHint />;
  } else {
    return <Loading />;
  }
};

export const ChartScatterplot = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: DimensionWithMeta[];
    measures: $FixMe[];
    fields: ScatterPlotFields;
  }) => {
    return (
      <ScatterplotChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={1}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthLinear />
            <Scatterplot />
            {/* <Interaction /> */}
          </ChartSvg>
          {/* <Tooltip /> */}
        </ChartContainer>
        {fields.segment && <LegendColor symbol="circle" />}
      </ScatterplotChart>
    );
  }
);
