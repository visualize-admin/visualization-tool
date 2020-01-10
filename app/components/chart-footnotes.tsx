import { Trans } from "@lingui/macro";
import React from "react";
import { Text } from "@theme-ui/components";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  Filters,
  FilterValueSingle
} from "../domain";

export const ChartFootnotes = ({
  source,
  dataSetName,
  filters,
  componentsByIri
}: {
  source: string;
  dataSetName: string;
  filters: Filters;
  componentsByIri: Record<string, DimensionWithMeta | AttributeWithMeta>;
}) => {
  const namedFilters: Array<{
    dimension: string;
    value: string;
  }> = Object.entries(filters)
    .filter(([dimIri, filter]) => filter.type === "single")
    .map(([dimIri, filter]) => {
      return {
        dimension: componentsByIri[dimIri].component.label.value,
        value: componentsByIri[dimIri].values.filter(
          v => v.value.value === (filter as FilterValueSingle).value
        )[0].label.value
      };
    });

  return (
    <>
      <Text variant="meta" color="monochrome600">
        <Trans id="metadata.source">Source</Trans>: {source}
      </Text>

      <Text variant="meta" color="monochrome600">
        <Trans id="metadata.dataset">Dataset</Trans>: {dataSetName}
      </Text>

      <Text variant="meta" color="monochrome600">
        <Trans id="metadata.filter">Data</Trans>:
        {namedFilters.map((f, i) => (
          <React.Fragment key={f.dimension}>
            {" "}
            <span>{f.dimension}</span> (<span>{f.value}</span>)
            {i < namedFilters.length - 1 && ","}
          </React.Fragment>
        ))}
      </Text>
    </>
  );
};
