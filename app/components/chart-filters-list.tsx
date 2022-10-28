import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { ChartConfig, DataSource } from "@/configurator";
import { isTemporalDimension } from "@/domain/data";
import { useTimeFormatUnit } from "@/formatters";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";
import { MaybeTooltip } from "@/utils/maybe-tooltip";

export const ChartFiltersList = ({
  dataSetIri,
  dataSource,
  chartConfig,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const timeFormatUnit = useTimeFormatUnit();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const queryFilters = useQueryFilters({
    chartConfig,
  });
  if (data?.dataCubeByIri) {
    const {
      dataCubeByIri: { dimensions },
    } = data;

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
        : dimension.values.find((v) => v.value === f.value);

      return [
        {
          dimension,
          value,
        },
      ];
    });

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
                  <MaybeTooltip text={dimension.description || undefined}>
                    <span
                      style={{
                        textDecoration: dimension.description
                          ? "underline"
                          : undefined,
                      }}
                    >
                      {dimension.label}
                    </span>
                  </MaybeTooltip>

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
