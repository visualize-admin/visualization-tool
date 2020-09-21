import React, { memo } from "react";
import { Box } from "theme-ui";
import { AreaConfig, AreaFields } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { A11yTable } from "./a11y-table";
import { Ruler } from "./charts-generic/annotations/ruler";
import { Tooltip } from "./charts-generic/annotations/tooltip";
import { Areas } from "./charts-generic/areas/areas";
import { AreaChart } from "./charts-generic/areas/areas-state";
import { AxisTime, AxisTimeDomain } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { InteractionHorizontal } from "./charts-generic/overlay/overlay-horizontal";
import { LegendColor } from "./charts-generic/legends/color";
import { Loading, LoadingOverlay, NoDataHint } from "./hint";

export const ChartAreasVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: AreaConfig;
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters,
    },
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartAreas
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (observations && !observations.map((obs) => obs.y).some(isNumber)) {
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
    fields,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: AreaFields;
  }) => {
    return (
      <AreaChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime /> <AxisHeightLinear />
            <Areas /> <AxisTimeDomain />
            <InteractionHorizontal />
          </ChartSvg>
          <Tooltip type={fields.segment ? "multiple" : "single"} />
          <Ruler />
        </ChartContainer>
        {fields.segment && <LegendColor symbol="square" />}
      </AreaChart>
    );
  }
);
