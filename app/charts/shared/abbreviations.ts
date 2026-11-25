import { useCallback, useMemo } from "react";

import {
  DimensionValue,
  getDimensionValueLabel,
  getObservationIri,
  Observation,
  ObservationValue,
} from "@/domain/data";

type DimensionValueLookups = {
  valueLookup: Map<NonNullable<ObservationValue>, DimensionValue>;
  labelLookup: Map<string, DimensionValue>;
};

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
      const { valueLookup, labelLookup } = makeDimensionValueLookups(
        dimensionValues ?? []
      );

      const abbreviationOrLabelLookup = new Map(
        Array.from(labelLookup.values(), (dimensionValue) => [
          getDimensionValueLabel({ dimensionValue, useAbbreviations }),
          dimensionValue,
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

      const dimensionValue = findDimensionValue({
        observation: d,
        dimensionId,
        valueLookup,
        labelLookup,
      });
      return dimensionValue
        ? getDimensionValueLabel({ dimensionValue, useAbbreviations })
        : "";
    },
    [dimensionId, valueLookup, labelLookup, useAbbreviations]
  );

  return {
    abbreviationOrLabelLookup,
    getAbbreviationOrLabelByValue,
  };
};

export const makeDimensionValueLookups = (
  values: DimensionValue[]
): DimensionValueLookups => {
  const valueLookup: DimensionValueLookups["valueLookup"] = new Map();
  const labelLookup: DimensionValueLookups["labelLookup"] = new Map();

  for (const d of values) {
    valueLookup.set(d.value, d);
    labelLookup.set(d.label, d);
  }

  return { valueLookup, labelLookup };
};

export const findDimensionValue = ({
  observation,
  dimensionId,
  valueLookup,
  labelLookup,
}: DimensionValueLookups & {
  observation: Observation;
  dimensionId: string;
}) => {
  const value = getObservationIri(observation, dimensionId);
  const label = observation[dimensionId] as string | undefined;

  return (
    (value ? valueLookup.get(value) : undefined) ??
    (label ? labelLookup.get(label) : undefined)
  );
};
