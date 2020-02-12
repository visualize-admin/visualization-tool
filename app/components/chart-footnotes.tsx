import { Trans } from "@lingui/macro";
import React from "react";
import { Text } from "@theme-ui/components";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  Filters,
  FilterValueSingle,
  ChartConfig
} from "../domain";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

export const ChartFootnotes = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: dataSetIri, locale }
  });

  if (data?.dataCubeByIri) {
    const {
      dataCubeByIri: { dimensions }
    } = data;

    const namedFilters = Object.entries(chartConfig.filters).flatMap(
      ([iri, f]) => {
        if (f.type !== "single") {
          return [];
        }

        const dimension = dimensions.find(d => d.iri === iri)!;
        const value = dimension?.values.find(v => v.value === f.value);

        return [
          {
            dimension,
            value
          }
        ];
      }
    );

    return (
      <>
        <Text variant="meta" color="monochrome600">
          <Trans id="metadata.source">Source</Trans>:{" "}
          {data.dataCubeByIri.source}
        </Text>

        <Text variant="meta" color="monochrome600">
          <Trans id="metadata.dataset">Dataset</Trans>:{" "}
          {data.dataCubeByIri.title}
        </Text>

        <Text variant="meta" color="monochrome600">
          <Trans id="metadata.filter">Data</Trans>:
          {namedFilters.map(({ dimension, value }, i) => (
            <React.Fragment key={dimension.iri}>
              {" "}
              <span>{dimension.label}</span> (<span>{value?.label}</span>)
              {i < namedFilters.length - 1 && ","}
            </React.Fragment>
          ))}
        </Text>
      </>
    );
  } else {
    return null;
  }
};
