import React, { memo } from "react";
import { LineConfig, LineFields } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { A11yTable } from "./a11y-table";
import { HoverDot } from "./charts-generic/annotations/hover-dot";
import { Ruler } from "./charts-generic/annotations/ruler";
import { Tooltip } from "./charts-generic/annotations/tooltip";
import { AxisTime } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { InteractionVoronoi } from "./charts-generic/interaction/interaction-voronoi";
import { LegendColor } from "./charts-generic/legends/color";
import { HoverLine } from "./charts-generic/lines/hover-line";
import { HoverLineValues } from "./charts-generic/lines/hover-line-values";
import { Lines } from "./charts-generic/lines/lines";
import { LineChart } from "./charts-generic/lines/lines-state";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { HoverDotMultiple } from "./charts-generic/annotations/hover-dots-multiple";

export const ChartLinesVisualization = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: LineConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters
    }
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
        <ChartLines
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <DataDownload
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
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
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
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
            <HoverLine />
            <HoverLineValues />

            <InteractionVoronoi />
          </ChartSvg>

          <Ruler />

          <HoverDotMultiple />

          {/* <HoverDot /> */}

          <Tooltip type={fields.segment ? "multiple" : "single"} />
        </ChartContainer>

        {fields.segment && <LegendColor symbol="line" />}
      </LineChart>
    );
  }
);
