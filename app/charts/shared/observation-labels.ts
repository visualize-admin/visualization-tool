import { useCallback, useMemo } from "react";

import { Observation } from "@/domain/data";

export const getObservationLabels = (
  data: Observation[],
  getLabel: (d: Observation) => string,
  componentIri?: string
) => {
  const getIri = (d: Observation) => {
    const iri = d[`${componentIri}/__iri__`] as string | undefined;
    return iri;
  };

  const lookup = new Map<string, string>();
  data.forEach((d) => {
    const iri = getIri(d);
    const label = getLabel(d);
    lookup.set(iri ?? label, label);
  });

  const getValue = (d: Observation) => {
    return getIri(d) ?? getLabel(d);
  };

  const getLookupLabel = (d: string) => {
    return lookup.get(d) ?? d;
  };

  return {
    getValue,
    getLabel: getLookupLabel,
  };
};

/** Use this hook to be able to retrieve observation values and labels,
 * where the value is the iri if present, otherwise the label.
 *
 * @param data The data to retrieve the labels from.
 * @param getLabel A function that returns the label (or abbreviation) for a given observation.
 * @param componentIri The iri of the component to extract value / label for.
 */
export const useObservationLabels = (
  data: Observation[],
  getLabel: (d: Observation) => string,
  componentIri?: string
) => {
  const getIri = useCallback(
    (d: Observation) => {
      const iri = d[`${componentIri}/__iri__`] as string | undefined;
      return iri;
    },
    [componentIri]
  );

  const lookup = useMemo(() => {
    const lookup = new Map<string, string>();
    data.forEach((d) => {
      const iri = getIri(d);
      const label = getLabel(d);
      lookup.set(iri ?? label, label);
    });

    return lookup;
  }, [data, getIri, getLabel]);

  const getValue = useCallback(
    (d: Observation) => {
      return getIri(d) ?? getLabel(d);
    },
    [getIri, getLabel]
  );

  const getLookupLabel = useCallback(
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
