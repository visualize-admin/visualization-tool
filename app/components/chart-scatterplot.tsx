import React, { memo } from "react";
import { ScatterPlotFields } from "../domain";
import { ScatterPlotConfig } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { A11yTable } from "./a11y-table";

import { AxisWidthLinear, AxisWidthLinearDomain } from "./charts-generic/axis";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { InteractionVoronoi } from "./charts-generic/interaction/interaction-voronoi";
import { LegendColor } from "./charts-generic/legends/color";
import { Scatterplot } from "./charts-generic/scatterplot";
import { ScatterplotChart } from "./charts-generic/scatterplot/scatterplot-state";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { Tooltip } from "./charts-generic/annotations/tooltip";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ScatterPlotConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [
        chartConfig.fields.x.componentIri,
        chartConfig.fields.y.componentIri,
      ], // FIXME: Other fields may also be measures
      filters: chartConfig.filters,
    },
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartScatterplot
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
      </>
    ) : (
      <NoDataHint />
    );
  } else if (
    (observations &&
      !observations.map((obs: $FixMe) => obs.x).some(isNumber)) ||
    (observations && !observations.map((obs: $FixMe) => obs.y).some(isNumber))
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
    fields,
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
        dimensions={dimensions}
        measures={measures}
        aspectRatio={1}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear />
            <AxisHeightLinear />
            <AxisWidthLinearDomain />
            <AxisHeightLinearDomain />
            <Scatterplot />
            <InteractionVoronoi />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        {fields.segment && <LegendColor symbol="circle" />}
      </ScatterplotChart>
    );
  }
);
