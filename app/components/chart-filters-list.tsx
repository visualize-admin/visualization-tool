import { Fragment } from "react";
import { Text, Box } from "theme-ui";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
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

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: dataSetIri, locale },
  });

  const queryFilters = useQueryFilters({
    chartConfig,
    interactiveFiltersIsActive:
      chartConfig.interactiveFiltersConfig?.dataFilters.active ?? false,
  });
  if (data?.dataCubeByIri) {
    const {
      dataCubeByIri: { dimensions },
    } = data;

    const namedFilters = Object.entries(queryFilters).flatMap(([iri, f]) => {
      if (f.type !== "single") {
        return [];
      }

      const dimension = dimensions.find((d) => d.iri === iri);
      const value = dimension?.values.find((v) => v.value === f.value);

      if (!dimension) {
        return [];
      }

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
          <Text variant="paragraph2" sx={{ color: "monochrome800" }}>
            {namedFilters.map(({ dimension, value }, i) => (
              <Fragment key={dimension.iri}>
                <Box as="span">
                  {dimension.label}
                  {": "}
                </Box>

                <Box as="span" sx={{ fontWeight: "bold" }}>
                  {value?.label}
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
