import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { Fragment, useMemo } from "react";

import {
  extractChartConfigComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import {
  ChartConfig,
  DataSource,
  FilterValue,
  getAnimationField,
} from "@/configurator";
import {
  Component,
  isTemporalDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { isMostRecentValue } from "@/domain/most-recent-value";
import { useTimeFormatUnit } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

export const ChartFiltersList = ({
  cubeIri,
  dataSource,
  chartConfig,
  components,
}: {
  cubeIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  components: Component[];
}) => {
  const locale = useLocale();
  const timeFormatUnit = useTimeFormatUnit();
  const timeSlider = useChartInteractiveFilters((d) => d.timeSlider);
  const animationField = getAnimationField(chartConfig);
  const queryFilters = useQueryFilters({
    chartConfig,
    componentIris: extractChartConfigComponentIris({ chartConfig }),
  });
  const cubeQueryFilters = useMemo(() => {
    return queryFilters.filter((d) => d.iri === cubeIri);
  }, [queryFilters, cubeIri]);
  // TODO: Refactor to somehow access current filter labels instead of fetching them again
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris: extractChartConfigComponentIris({ chartConfig }),
        filters: cubeQueryFilters.find((f) => f.iri === cube.iri)?.filters,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });
  const allFilters = useMemo(() => {
    if (!data?.dataCubesComponents || components.length === 0) {
      return [];
    }

    return queryFilters.flatMap((filter) => {
      const namedFilters = Object.entries<FilterValue>(
        filter.filters ?? {}
      ).flatMap(([iri, f]) => {
        if (f?.type !== "single") {
          return [];
        }

        const dimension = data.dataCubesComponents.dimensions.find(
          (d) => d.iri === iri && d.cubeIri === filter.iri
        );

        if (!dimension) {
          return [];
        }

        const filterValue = isMostRecentValue(f.value)
          ? dimension.values[dimension.values.length - 1].value
          : f.value;
        const value = isTemporalDimension(dimension)
          ? {
              value: filterValue,
              label: timeFormatUnit(`${filterValue}`, dimension.timeUnit),
            }
          : dimension.values.find((d) => d.value === filterValue);

        return [{ dimension, value }];
      });

      if (animationField) {
        const dimension = components.find(
          (d) =>
            d.iri === animationField.componentIri && d.cubeIri === filter.iri
        );

        if (timeSlider.value) {
          if (
            timeSlider.type === "interval" &&
            isTemporalDimension(dimension)
          ) {
            namedFilters.push({
              dimension,
              value: {
                value: `${timeSlider.value}`,
                label: timeFormatUnit(timeSlider.value, dimension.timeUnit),
              },
            });
          }

          if (
            timeSlider.type === "ordinal" &&
            timeSlider.value &&
            isTemporalOrdinalDimension(dimension)
          ) {
            namedFilters.push({
              dimension,
              value: {
                value: timeSlider.value,
                label: timeSlider.value,
              },
            });
          }
        }
      }

      return namedFilters;
    });
  }, [
    data?.dataCubesComponents,
    components,
    queryFilters,
    animationField,
    timeFormatUnit,
    timeSlider.value,
    timeSlider.type,
  ]);

  return fetching ? (
    <Typography component="div" variant="caption" color="grey.600">
      <Trans id="controls.section.data.filters">Filters</Trans>:{" "}
      <Trans id="hint.loading.data">Loading data...</Trans>
    </Typography>
  ) : allFilters.length ? (
    <Typography
      component="div"
      variant="caption"
      color="grey.600"
      data-testid="chart-filters-list"
    >
      <Typography
        component="span"
        variant="inherit"
        color="grey.600"
        sx={{ mr: 1 }}
      >
        <Trans id="controls.section.data.filters">Filters</Trans>:
      </Typography>
      {allFilters.map(({ dimension, value }, i) => (
        <Fragment key={dimension.iri}>
          <span>
            <OpenMetadataPanelWrapper component={dimension}>
              <span>{dimension.label}</span>
            </OpenMetadataPanelWrapper>
            {": "}
          </span>
          <span>{value && value.label}</span>
          {i < allFilters.length - 1 && ", "}
        </Fragment>
      ))}
    </Typography>
  ) : null;
};
