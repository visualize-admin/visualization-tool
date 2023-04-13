import React from "react";

import { Observation } from "@/domain/data";

export const useObservationLabels = (
  data: Observation[],
  getLabel: (d: Observation) => string,
  componentIri?: string
) => {
  const getIri = React.useCallback(
    (d: Observation) => {
      const iri = d[`${componentIri}/__iri__`] as string | undefined;
      return iri;
    },
    [componentIri]
  );

  const lookup = React.useMemo(() => {
    const lookup = new Map<string, string>();
    data.forEach((d) => {
      const iri = getIri(d);
      const label = getLabel(d);
      lookup.set(iri ?? label, label);
    });

    return lookup;
  }, [data, getIri, getLabel]);

  const getValue = React.useCallback(
    (d: Observation) => {
      return getIri(d) ?? getLabel(d);
    },
    [getIri, getLabel]
  );

  const getLookupLabel = React.useCallback(
    (d: string) => {
      return lookup.get(d) ?? d;
    },
    [lookup]
  );

  return {
    getValue,
    getLabel: getLookupLabel,
  };
};
