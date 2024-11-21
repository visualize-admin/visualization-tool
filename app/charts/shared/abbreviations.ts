import { useCallback, useMemo } from "react";

import { DimensionValue, Observation, ObservationValue } from "@/domain/data";

export const useMaybeAbbreviations = ({
  useAbbreviations,
  dimensionId,
  dimensionValues,
}: {
  useAbbreviations: boolean | undefined;
  dimensionId: string | undefined;
  dimensionValues: DimensionValue[] | undefined;
}) => {
  const { valueLookup, labelLookup, abbreviationOrLabelLookup } =
    useMemo(() => {
      const values = dimensionValues ?? [];

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
    }, [dimensionValues, useAbbreviations]);

  const getAbbreviationOrLabelByValue = useCallback(
    (d: Observation) => {
      if (!dimensionId) {
        return "";
      }

      const value = d[`${dimensionId}/__iri__`] as string | undefined;
      const label = d[dimensionId] as string | undefined;

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
    [dimensionId, valueLookup, labelLookup, useAbbreviations]
  );

  return {
    abbreviationOrLabelLookup,
    getAbbreviationOrLabelByValue,
  };
};
