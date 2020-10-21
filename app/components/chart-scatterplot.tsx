import { memo } from "react";
import { Box } from "theme-ui";
import { ScatterPlotFields } from "../configurator";
import { ScatterPlotConfig } from "../configurator";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { A11yTable } from "./a11y-table";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "./charts-generic/axis/axis-width-linear";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "./charts-generic/axis/axis-height-linear";
import {
  ChartContainer,
  ChartSvg,
} from "./charts-generic/containers/containers";
import { InteractionVoronoi } from "./charts-generic/overlay/overlay-voronoi";
import { LegendColor } from "./charts-generic/legends/color";
import { Scatterplot } from "./charts-generic/scatterplot/scatterplot-simple";
import { ScatterplotChart } from "./charts-generic/scatterplot/scatterplot-state";
import { Loading, LoadingOverlay, NoDataHint } from "./hint";

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
