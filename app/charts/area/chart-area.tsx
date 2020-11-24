import React, { memo } from "react";
import { Box } from "theme-ui";
import { AreaConfig, AreaFields } from "../../configurator";
import { Observation } from "../../domain/data";
import { isNumber } from "../../configurator/components/ui-helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { Ruler } from "../shared/interaction/ruler";
import { Tooltip } from "../shared/interaction/tooltip";
import { Areas } from "./areas";
import { AreaChart } from "./areas-state";
import { AxisTime, AxisTimeDomain } from "../shared/axis-width-time";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractionHorizontal } from "../shared/overlay-horizontal";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";
import { Brush } from "../shared/brush";

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
            {/* <Brush /> */}
          </ChartSvg>
          <Tooltip type={fields.segment ? "multiple" : "single"} />
          <Ruler />
        </ChartContainer>
        {fields.segment && <InteractiveLegendColor symbol="square" />}
      </AreaChart>
    );
  }
);
