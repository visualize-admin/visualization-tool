import React from "react";

import { DimensionValue, Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const useMaybeAbbreviations = ({
  useAbbreviations,
  dimension,
}: {
  useAbbreviations: boolean;
  dimension: DimensionMetadataFragment | undefined;
}) => {
  const { labelLookup, abbreviationOrLabelLookup } = React.useMemo(() => {
    const values = dimension?.values ?? [];

    const labelLookup = new Map<DimensionValue["label"], DimensionValue>();
    for (let dv of values) {
      const existing = labelLookup.get(dv.label);
      if (existing) {
        console.info(
          "Value with iri ",
          dv.value,
          "has same label as",
          existing
        );
      } else {
        labelLookup.set(dv.label, dv);
      }
    }
    const abbreviationOrLabelLookup = new Map(
      Array.from(labelLookup, (d) => [
        useAbbreviations ? d[1].alternateName ?? d[1].label : d[1].label,
        d[1],
      ])
    );

    return {
      labelLookup,
      abbreviationOrLabelLookup,
    };
  }, [dimension?.values, useAbbreviations]);

  const getAbbreviationOrLabelByValue = React.useCallback(
    (d: Observation) => {
      const v = d[dimension?.iri || ""] as string | undefined;

      if (!v) {
        return "";
      }

      const lookedUpValue = labelLookup.get(v);

      return useAbbreviations
        ? lookedUpValue?.alternateName ?? lookedUpValue?.label ?? ""
        : v;
    },
    [dimension?.iri, labelLookup, useAbbreviations]
  );

  const getLabelByAbbreviation = React.useCallback(
    (d: string) => {
      const v = abbreviationOrLabelLookup.get(d);

      return useAbbreviations ? v?.alternateName ?? v?.label ?? "" : d;
    },
    [abbreviationOrLabelLookup, useAbbreviations]
  );

  return {
    abbreviationOrLabelLookup,
    getAbbreviationOrLabelByValue,
    getLabelByAbbreviation,
  };
};
