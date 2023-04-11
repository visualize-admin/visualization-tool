import React from "react";

import { DimensionValue, Observation, ObservationValue } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const useMaybeAbbreviations = ({
  useAbbreviations,
  dimension,
}: {
  useAbbreviations: boolean;
  dimension: DimensionMetadataFragment | undefined;
}) => {
  const {
    valueLookup,
    labelLookup,
    abbreviationOrValueLookup,
    abbreviationOrLabelLookup,
  } = React.useMemo(() => {
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

    const abbreviationOrValueLookup = new Map(
      Array.from(valueLookup, ([k, v]) => [
        useAbbreviations ? v.alternateName ?? k : k,
        v,
      ])
    );
    const abbreviationOrLabelLookup = new Map(
      Array.from(labelLookup, ([k, v]) => [
        useAbbreviations ? v.alternateName ?? k : k,
        v,
      ])
    );

    return {
      valueLookup,
      labelLookup,
      abbreviationOrValueLookup,
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

  const getLabelByAbbreviation = React.useCallback(
    (d: string) => {
      const observation =
        abbreviationOrValueLookup.get(d) ?? abbreviationOrLabelLookup.get(d);

      return useAbbreviations
        ? observation?.alternateName ?? observation?.label ?? ""
        : d;
    },
    [abbreviationOrValueLookup, abbreviationOrLabelLookup, useAbbreviations]
  );

  return {
    abbreviationOrValueLookup,
    abbreviationOrLabelLookup,
    getAbbreviationOrLabelByValue,
    getLabelByAbbreviation,
  };
};
