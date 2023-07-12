import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import {
  getChartConfigFilterComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { ChartConfig, DataSource, getAnimationField } from "@/configurator";
import { isTemporalDimension } from "@/domain/data";
import { useTimeFormatUnit } from "@/formatters";
import { useComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

type ChartFiltersListProps = {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
};

export const ChartFiltersList = (props: ChartFiltersListProps) => {
  const { dataSetIri, dataSource, chartConfig } = props;
  const locale = useLocale();
  const timeFormatUnit = useTimeFormatUnit();
  const [IFState] = useInteractiveFilters();

  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris: getChartConfigFilterComponentIris(chartConfig),
    },
  });

  const queryFilters = useQueryFilters({ chartConfig });

  if (data?.dataCubeByIri) {
    const dimensions = data.dataCubeByIri.dimensions;
    const namedFilters = Object.entries(queryFilters).flatMap(([iri, f]) => {
      if (f?.type !== "single") {
        return [];
      }

      const dimension = dimensions.find((d) => d.iri === iri);
      if (!dimension) {
        return [];
      }

      const value = isTemporalDimension(dimension)
        ? {
            value: f.value,
            label: timeFormatUnit(f.value, dimension.timeUnit),
          }
        : dimension.values.find((d) => d.value === f.value);

      return [{ dimension, value }];
    });

    const animationField = getAnimationField(chartConfig);
    if (animationField) {
      const dimension = dimensions.find(
        (d) => d.iri === animationField.componentIri
      );
      const timeSliderFilter = IFState.timeSlider.value;

      if (isTemporalDimension(dimension) && timeSliderFilter) {
        namedFilters.push({
          dimension,
          value: {
            value: timeSliderFilter,
            label: timeFormatUnit(timeSliderFilter, dimension.timeUnit),
          },
        });
      }
    }

    return (
      <>
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
      </>
    );
  } else {
    return null;
  }
};
