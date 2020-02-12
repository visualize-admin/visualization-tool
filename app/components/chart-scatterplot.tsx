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
import { useLocale } from "../lib/use-locale";
import { ComponentFieldsFragment, useDataCubeObservationsQuery } from "../graphql/query-hooks";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: ScatterPlotConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.x.componentIri,chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters
    }
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <>
        {/* <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          observations={observations}
        /> */}
        <ChartScatterplot
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        {/* <DataDownload
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        /> */}
      </>
    ) : (
      <NoDataHint />
    );
  } else if (
    (observations && !observations.map((obs:$FixMe) => obs.x).some(isNumber)) ||
    (observations && !observations.map((obs:$FixMe) => obs.y).some(isNumber))
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
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
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
