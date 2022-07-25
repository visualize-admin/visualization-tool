import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useDataSource } from "@/components/data-source-menu";
import { ChartConfig } from "@/configurator";
import { useTimeFormatUnit } from "@/configurator/components/ui-helpers";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartFiltersList = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const [dataSource] = useDataSource();
  const locale = useLocale();
  const timeFormatUnit = useTimeFormatUnit();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { dataSource, iri: dataSetIri, locale },
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

      const value =
        dimension.__typename === "TemporalDimension"
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
          >
            {namedFilters.map(({ dimension, value }, i) => (
              <Fragment key={dimension.iri}>
                <Box component="span">
                  {dimension.label}
                  {": "}
                </Box>

                <Box component="span" sx={{ fontWeight: "bold" }}>
                  {value && value.label}
                </Box>
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
