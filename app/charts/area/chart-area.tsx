import React, { memo, useEffect, useMemo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay } from "../../components/hint";
import {
  AreaConfig,
  AreaFields,
  InteractiveFiltersConfig,
} from "../../configurator";
import { isNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "../shared/axis-width-time";
import { BrushTime } from "../shared/brush";
import { QueryFilters } from "../shared/chart-helpers";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { useChartError } from "../shared/errors";
import { Ruler } from "../shared/interaction/ruler";
import { Tooltip } from "../shared/interaction/tooltip";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { InteractionHorizontal } from "../shared/overlay-horizontal";
import { Areas } from "./areas";
import { AreaChart } from "./areas-state";

export const ChartAreasVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: AreaConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const { setChartError } = useChartError();
  const [{ data, fetching, error: dataLoadingError }] =
    useDataCubeObservationsQuery({
      variables: {
        locale,
        iri: dataSetIri,
        dimensions: null, // FIXME: Try to load less dimensions
        filters: queryFilters,
      },
    });

  const observations = data?.dataCubeByIri?.observations.data;
  const observationsPresent = useMemo(
    () =>
      observations
        ? observations.length > 0 && observations.map((d) => d.y).some(isNumber)
        : false,
    [observations]
  );

  useEffect(() => {
    if (!fetching) {
      if (dataLoadingError) {
        setChartError("dataLoading");
      } else if (!observationsPresent) {
        setChartError("noData");
      }
    }
  }, [fetching, dataLoadingError, observationsPresent, setChartError]);

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartAreas
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

export const ChartAreas = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    fields: AreaFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <AreaChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime /> <AxisHeightLinear />
            <Areas /> <AxisTimeDomain />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.time.active === true && <BrushTime />}
          </ChartSvg>
          <Tooltip type={fields.segment ? "multiple" : "single"} />
          <Ruler />
        </ChartContainer>
        {fields.segment && interactiveFiltersConfig?.legend.active === true ? (
          <InteractiveLegendColor />
        ) : fields.segment ? (
          <LegendColor symbol="line" />
        ) : null}
      </AreaChart>
    );
  }
);
