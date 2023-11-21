import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import Flex from "@/components/flex";
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
import { useTimeFormatUnit } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";
import { useInteractiveFilters } from "@/stores/interactive-filters";

type ChartFiltersListProps = {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measures: Measure[];
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
  });
  const [{ data }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: filters.map((filter) => ({
        iri: filter.iri,
        componentIris: filter.componentIris,
        filters: filter.filters,
      })),
    },
  });

  if (data?.dataCubesComponents) {
    const { dimensions } = data.dataCubesComponents;

    return (
      <>
        {filters.map((filter) => {
          const namedFilters = Object.entries<FilterValue>(
            filter.filters ?? {}
          ).flatMap(([iri, f]) => {
            if (f?.type !== "single") {
              return [];
            }

            const dimension = dimensions.find(
              (d) => d.iri === iri && d.cubeIri === filter.iri
            );

            if (!dimension) {
              return [];
            }

            const value = isTemporalDimension(dimension)
              ? {
                  value: f.value,
                  label: timeFormatUnit(`${f.value}`, dimension.timeUnit),
                }
              : dimension.values.find((d) => d.value === f.value);

            return [{ dimension, value }];
          });

          if (animationField) {
            const dimension = dimensions.find(
              (d) =>
                d.iri === animationField.componentIri &&
                d.cubeIri === filter.iri
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

          return (
            <Flex key={filter.iri} sx={{ flexDirection: "column", my: 2 }}>
              {namedFilters.length > 0 && (
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ color: "grey.800" }}
                  data-testid="chart-filters-list"
                >
                  {namedFilters.map(({ dimension, value }, i) => (
                    <Fragment key={dimension.iri}>
                      <Box component="span" fontWeight="bold">
                        <OpenMetadataPanelWrapper dim={dimension}>
                          <span style={{ fontWeight: "bold" }}>
                            {dimension.label}
                          </span>
                        </OpenMetadataPanelWrapper>

                        {": "}
                      </Box>

                      <Box component="span">{value && value.label}</Box>
                      {i < namedFilters.length - 1 && ", "}
                    </Fragment>
                  ))}
                </Typography>
              )}
            </Flex>
          );
        })}
      </>
    );
  } else {
    return null;
  }
};
