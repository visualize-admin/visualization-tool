import { memo } from "react";
import { Box } from "theme-ui";
import { BarConfig, BarFields } from "../configurator";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { A11yTable } from "./a11y-table";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { BarsGrouped } from "./charts-generic/bars/bars-grouped";
import { GroupedBarsChart } from "./charts-generic/bars/bars-grouped-state";
import { Bars } from "./charts-generic/bars/bars-simple";
import { BarChart } from "./charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "./charts-generic/containers/containers";
import { LegendColor } from "./charts-generic/legends/color";
import { Loading, LoadingOverlay, NoDataHint } from "./hint";

export const ChartBarsVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: BarConfig;
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.x.componentIri], // FIXME: Other fields may also be measures
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
        <ChartBars
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

export const ChartBars = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: BarFields;
  }) => {
    return (
      <>
        {fields.segment?.componentIri ? (
          <GroupedBarsChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
          >
            <ChartContainer>
              <ChartSvg>
                <BarsGrouped />
                <AxisWidthLinear />
              </ChartSvg>
            </ChartContainer>
            <LegendColor symbol="square" />
          </GroupedBarsChart>
        ) : (
          <BarChart data={observations} fields={fields} measures={measures}>
            <ChartContainer>
              <ChartSvg>
                <Bars />
                <AxisWidthLinear />
              </ChartSvg>
            </ChartContainer>
          </BarChart>
        )}
      </>
    );
  }
);
