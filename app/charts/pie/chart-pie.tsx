import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  Loading,
  LoadingOverlay,
  NoDataHint,
  OnlyNegativeDataHint,
} from "../../components/hint";
import {
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
  PieConfig,
  PieFields,
} from "../../configurator";
import { Observation } from "../../domain/data";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { Tooltip } from "../shared/interaction/tooltip";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { Pie } from "./pie";
import { PieChart } from "./pie-state";

export const ChartPieVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: PieConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const locale = useLocale();

  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: queryFilters,
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
          interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
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
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: PieFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <PieChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
        aspectRatio={0.5}
      >
        <ChartContainer>
          <ChartSvg>
            <Pie />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        {fields.segment && interactiveFiltersConfig?.legend.active === true ? (
          <InteractiveLegendColor symbol="line" />
        ) : fields.segment ? (
          <LegendColor symbol="line" />
        ) : null}{" "}
      </PieChart>
    );
  }
);
