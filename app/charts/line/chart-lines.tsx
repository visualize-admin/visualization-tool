import { memo } from "react";
import { Box } from "theme-ui";
import { LineConfig, LineFields } from "../../configurator";
import { Observation } from "../../domain/data";
import { isNumber } from "../../configurator/components/ui-helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { HoverDotMultiple } from "../shared/interaction/hover-dots-multiple";
import { Ruler } from "../shared/interaction/ruler";
import { Tooltip } from "../shared/interaction/tooltip";
import { AxisTime, AxisTimeDomain } from "../shared/axis-width-time";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractionHorizontal } from "../shared/overlay-horizontal";
import { LegendColor } from "../shared/legend-color";
import { Lines } from "./lines";
import { LineChart } from "./lines-state";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";

export const ChartLinesVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: LineConfig;
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
        <ChartLines
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

export const ChartLines = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
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
        dimensions={dimensions}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <Lines />
            {/* <HoverLine /> <HoverLineValues /> */}
            <InteractionHorizontal />
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
