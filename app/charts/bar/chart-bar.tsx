import React, { memo } from "react";

import { BarsGrouped } from "@/charts/bar/bars-grouped";
import { GroupedBarsChart } from "@/charts/bar/bars-grouped-state";
import { Bars } from "@/charts/bar/bars-simple";
import { BarChart } from "@/charts/bar/bars-state";
import { AxisWidthLinear } from "@/charts/shared/axis-width-linear";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import {
  InteractiveLegendColor,
  LegendColor,
} from "@/charts/shared/legend-color";
import {
  Filters,
  BarConfig,
  BarFields,
  InteractiveFiltersConfig,
  FilterValueSingle,
  DataSource,
} from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

export const ChartBarsVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: BarConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const locale = useLocale();
  const [queryResp] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
      filters: queryFilters,
    },
  });

  return (
    <ChartLoadingWrapper
      query={queryResp}
      chartConfig={chartConfig}
      Component={ChartBars}
    />
  );
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
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
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
            interactiveFiltersConfig?.legend.active === true ? (
              <InteractiveLegendColor />
            ) : fields.segment ? (
              <LegendColor symbol="square" />
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
