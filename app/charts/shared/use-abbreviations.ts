import React from "react";

import { DimensionValue, Observation, ObservationValue } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const useMaybeAbbreviations = ({
  useAbbreviations,
  dimension,
}: {
  useAbbreviations: boolean | undefined;
  dimension: DimensionMetadataFragment | undefined;
}) => {
  const { valueLookup, labelLookup, abbreviationOrLabelLookup } =
    React.useMemo(() => {
      const values = dimension?.values ?? [];

      const valueLookup = new Map<
        NonNullable<ObservationValue>,
        DimensionValue
      >();
      const labelLookup = new Map<string, DimensionValue>();

      for (const d of values) {
        valueLookup.set(d.value, d);
        labelLookup.set(d.label, d);
      }

      const abbreviationOrLabelLookup = new Map(
        Array.from(labelLookup, ([k, v]) => [
          useAbbreviations ? v.alternateName ?? k : k,
          v,
        ])
      );

      return {
        valueLookup,
        labelLookup,
        abbreviationOrLabelLookup,
      };
    }, [dimension?.values, useAbbreviations]);

  const getAbbreviationOrLabelByValue = React.useCallback(
    (d: Observation) => {
      if (!dimension) {
        return "";
      }

      const value = d[`${dimension.iri}/__iri__`] as string | undefined;
      const label = d[dimension.iri] as string | undefined;

      if (value === undefined && label === undefined) {
        return "";
      }

      const lookedUpObservation =
        (value ? valueLookup.get(value) : null) ??
        (label ? labelLookup.get(label) : null);
      const lookedUpLabel = lookedUpObservation?.label ?? "";

      return useAbbreviations
        ? lookedUpObservation?.alternateName ?? lookedUpLabel
        : lookedUpLabel;
    },
    [dimension, valueLookup, labelLookup, useAbbreviations]
  );

  return {
    abbreviationOrLabelLookup,
    getAbbreviationOrLabelByValue,
  };
};
