import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  Filters,
  BarConfig,
  BarFields,
  InteractiveFiltersConfig,
} from "../../configurator";
import { Observation } from "../../domain/data";
import { isNumber } from "../../configurator/components/ui-helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { AxisWidthLinear } from "../shared/axis-width-linear";
import { BarsGrouped } from "./bars-grouped";
import { GroupedBarsChart } from "./bars-grouped-state";
import { Bars } from "./bars-simple";
import { BarChart } from "./bars-state";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";

export const ChartBarsVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: BarConfig;
  queryFilters: Filters;
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.x.componentIri], // FIXME: Other fields may also be measures
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
        <ChartBars
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
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: BarFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
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
            {fields.segment &&
            interactiveFiltersConfig.legend.active === true ? (
              <InteractiveLegendColor symbol="line" />
            ) : fields.segment ? (
              <LegendColor symbol="line" />
            ) : null}
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
