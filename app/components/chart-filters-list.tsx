import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import {
  getChartConfigFilterComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { ChartConfig, DataSource, getAnimationField } from "@/configurator";
import { isTemporalDimension, isTemporalOrdinalDimension } from "@/domain/data";
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

  const animationField = getAnimationField(chartConfig);
  const componentIris = Array.from(
    new Set(
      getChartConfigFilterComponentIris(chartConfig).concat(
        // Animation field also needs to be displayed in the filters, if present.
        animationField ? [animationField.componentIri] : []
      )
    )
  );
  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris,
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

    if (animationField) {
      const dimension = dimensions.find(
        (d) => d.iri === animationField.componentIri
      );

      if (IFState.timeSlider.value) {
        if (
          IFState.timeSlider.type === "interval" &&
          isTemporalDimension(dimension)
        ) {
          namedFilters.push({
            dimension,
            value: {
              value: IFState.timeSlider.value,
              label: timeFormatUnit(
                IFState.timeSlider.value,
                dimension.timeUnit
              ),
            },
          });
        }

        if (
          IFState.timeSlider.type === "ordinal" &&
          IFState.timeSlider.value &&
          isTemporalOrdinalDimension(dimension)
        ) {
          namedFilters.push({
            dimension,
            value: {
              value: IFState.timeSlider.value,
              label: IFState.timeSlider.value,
            },
          });
        }
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
