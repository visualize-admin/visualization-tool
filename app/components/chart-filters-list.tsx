import { Fragment } from "react";
import { Box, Text } from "theme-ui";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { useFormatFullDateAuto } from "../configurator/components/ui-helpers";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";

export const ChartFiltersList = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const formatDateAuto = useFormatFullDateAuto();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: dataSetIri, locale },
  });

  const queryFilters = useQueryFilters({
    chartConfig,
    interactiveFiltersIsActive:
      chartConfig.interactiveFiltersConfig?.dataFilters.active,
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
          ? { value: f.value, label: formatDateAuto(f.value) }
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
          <Text as="div" variant="paragraph2" sx={{ color: "monochrome800" }}>
            {namedFilters.map(({ dimension, value }, i) => (
              <Fragment key={dimension.iri}>
                <Box as="span">
                  {dimension.label}
                  {": "}
                </Box>

                <Box as="span" sx={{ fontWeight: "bold" }}>
                  {value && value.label}
                </Box>
                {i < namedFilters.length - 1 && ", "}
              </Fragment>
            ))}
          </Text>
        )}
      </>
    );
  } else {
    return null;
  }
};
