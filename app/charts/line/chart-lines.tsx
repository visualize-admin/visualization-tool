import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "../../components/hint";
import {
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
  LineConfig,
  LineFields,
} from "../../configurator";
import { isNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "../shared/axis-width-time";
import { BrushTime } from "../shared/brush";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { HoverDotMultiple } from "../shared/interaction/hover-dots-multiple";
import { Ruler } from "../shared/interaction/ruler";
import { Tooltip } from "../shared/interaction/tooltip";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { InteractionHorizontal } from "../shared/overlay-horizontal";
import { Lines } from "./lines";
import { LineChart } from "./lines-state";

export const ChartLinesVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: LineConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const locale = useLocale();

  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: queryFilters,
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
          interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (observations && !observations.map((obs) => obs.y).some(isNumber)) {
    return <NoDataHint />;
  } else if (error) {
    return <LoadingDataError />;
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
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: LineFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <LineChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <Lines />
            {/* <HoverLine /> <HoverLineValues /> */}
            <InteractionHorizontal />
            {interactiveFiltersConfig?.time.active && <BrushTime />}
          </ChartSvg>

          <Ruler />

          <HoverDotMultiple />

          {/* <HoverDot /> */}

          <Tooltip type={fields.segment ? "multiple" : "single"} />
        </ChartContainer>

        {fields.segment && interactiveFiltersConfig?.legend.active ? (
          <InteractiveLegendColor symbol="line" />
        ) : fields.segment ? (
          <LegendColor symbol="line" />
        ) : null}
      </LineChart>
    );
  }
);
