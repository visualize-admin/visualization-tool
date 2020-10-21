import { memo } from "react";
import { Box } from "theme-ui";
import { PieConfig, PieFields } from "../configurator";
import { Observation } from "../domain/data";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { A11yTable } from "./a11y-table";
import {
  ChartContainer,
  ChartSvg,
} from "./charts-generic/containers/containers";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { LegendColor } from "./charts-generic/legends/color";
import { Pie } from "./charts-generic/pie/pie";
import { PieChart } from "./charts-generic/pie/pie-state";
import {
  Loading,
  LoadingOverlay,
  NoDataHint,
  OnlyNegativeDataHint,
} from "./hint";

export const ChartPieVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: PieConfig;
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

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;

    const notAllNegative = observations.data.some(
      (d) => d[chartConfig.fields.y.componentIri] > 0
    );

    return notAllNegative && observations.data.length > 0 ? (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartPie
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : !notAllNegative && observations.data.length > 0 ? (
      <OnlyNegativeDataHint />
    ) : (
      <NoDataHint />
    );
  } else {
    return <Loading />;
  }
};

export const ChartPie = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: PieFields;
  }) => {
    return (
      <PieChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        aspectRatio={0.5}
      >
        <ChartContainer>
          <ChartSvg>
            <Pie />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        {fields.segment && <LegendColor symbol="square" />}
      </PieChart>
    );
  }
);
