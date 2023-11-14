import React from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import {
  ComboLineSingleConfig,
  DataSource,
  QueryFilters,
} from "@/config-types";
import {
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineSingleVisualizationProps = {
  dataSetIri: string;
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ComboLineSingleConfig;
  queryFilters: QueryFilters;
};

export const ChartComboLineSingleVisualization = (
  props: ChartComboLineSingleVisualizationProps
) => {
  const { dataSetIri, dataSource, componentIris, chartConfig, queryFilters } =
    props;
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: {
      ...commonQueryVariables,
      iri: dataSetIri,
    },
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      filters: [{ iri: dataSetIri, componentIris }],
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      iri: dataSetIri,
      componentIris,
      filters: queryFilters,
    },
  });

  return (
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      chartConfig={chartConfig}
      Component={ChartComboLineSingle}
    />
  );
};

export const ChartComboLineSingle = React.memo(
  (props: ChartProps<ComboLineSingleConfig>) => {
    const { chartConfig, measures } = props;
    const { interactiveFiltersConfig } = chartConfig;

    const getLegendItemDimension = React.useCallback(
      (label) => {
        return measures.find((measure) => measure.label === label);
      },
      [measures]
    );

    return (
      <ComboLineSingleChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineSingle />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="line"
            getLegendItemDimension={getLegendItemDimension}
          />
        </ChartControlsContainer>
      </ComboLineSingleChart>
    );
  }
);
