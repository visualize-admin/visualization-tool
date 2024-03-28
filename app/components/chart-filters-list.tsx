import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import React, { Fragment } from "react";

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
  Dimension,
  Measure,
  isTemporalDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { isDynamicMaxValue } from "@/domain/max-value";
import { useTimeFormatUnit } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";
import { useInteractiveFilters } from "@/stores/interactive-filters";

type ChartFiltersListProps = {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
};

export const ChartFiltersList = (props: ChartFiltersListProps) => {
  const { dataSource, chartConfig, dimensions, measures } = props;
  const locale = useLocale();
  const timeFormatUnit = useTimeFormatUnit();
  const timeSlider = useInteractiveFilters((d) => d.timeSlider);
  const animationField = getAnimationField(chartConfig);
  const filters = useQueryFilters({
    chartConfig,
    dimensions,
    measures,
    componentIris: extractChartConfigComponentIris(chartConfig),
  });
  // TODO: Refactor to somehow access current filter labels instead of fetching them again
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters:
        filters?.map((filter) => ({
          iri: filter.iri,
          componentIris: filter.componentIris,
          filters: filter.filters,
          joinBy: filter.joinBy,
          loadValues: true,
        })) ?? [],
    },
    pause: !filters,
  });
  const allFilters = React.useMemo(() => {
    if (!data?.dataCubesComponents || !filters || !dimensions || !measures) {
      return [];
    }

    return filters.flatMap((filter) => {
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

        const filterValue = isDynamicMaxValue(f.value)
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
        const dimension = dimensions.find(
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
    dimensions,
    measures,
    filters,
    animationField,
    timeFormatUnit,
    timeSlider.value,
    timeSlider.type,
  ]);

  return fetching ? (
    <Typography component="div" variant="caption" color="grey.600">
      <b>
        <Trans id="controls.section.data.filters">Filters</Trans>:
      </b>{" "}
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
        fontWeight="bold"
        color="grey.600"
        sx={{ mr: 2 }}
      >
        <Trans id="controls.section.data.filters">Filters</Trans>:
      </Typography>
      {allFilters.map(({ dimension, value }, i) => (
        <Fragment key={dimension.iri}>
          <Box component="span" fontWeight="bold">
            <OpenMetadataPanelWrapper dim={dimension}>
              <span style={{ fontWeight: "bold" }}>{dimension.label}</span>
            </OpenMetadataPanelWrapper>
            {": "}
          </Box>

          <Box component="span">{value && value.label}</Box>
          {i < allFilters.length - 1 && ", "}
        </Fragment>
      ))}
    </Typography>
  ) : null;
};
