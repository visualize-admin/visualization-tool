import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  InteractiveFiltersConfig,
  ScatterPlotFields,
} from "../../configurator";
import { ScatterPlotConfig } from "../../configurator";
import { Observation } from "../../domain/data";
import { isNumber } from "../../configurator/components/ui-helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { Tooltip } from "../shared/interaction/tooltip";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../shared/axis-width-linear";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../shared/axis-height-linear";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractionVoronoi } from "../shared/overlay-voronoi";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { Scatterplot } from "./scatterplot-simple";
import { ScatterplotChart } from "./scatterplot-state";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ScatterPlotConfig;
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeObservationsQuery({
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
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
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
          interactiveFilters={chartConfig.interactiveFilters}
        />
        {fetching && <LoadingOverlay />}
      </Box>
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
    interactiveFilters,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: ScatterPlotFields;
    interactiveFilters: InteractiveFiltersConfig;
  }) => {
    return (
      <ScatterplotChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFilters}
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
        {fields.segment && interactiveFilters.legend.active === true ? (
          <InteractiveLegendColor symbol="line" />
        ) : fields.segment ? (
          <LegendColor symbol="line" />
        ) : null}{" "}
      </ScatterplotChart>
    );
  }
);
