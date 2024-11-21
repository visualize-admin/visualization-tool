import { useCallback, useMemo } from "react";

import { Observation } from "@/domain/data";

/** Use this hook to be able to retrieve observation values and labels,
 * where the value is the id if present, otherwise the label.
 *
 * @param data The data to retrieve the labels from.
 * @param getLabel A function that returns the label (or abbreviation) for a given observation.
 * @param componentId The id of the component to extract value / label for.
 */
export const useObservationLabels = (
  data: Observation[],
  getLabel: (d: Observation) => string,
  componentId?: string
) => {
  const getId = useCallback(
    (d: Observation) => {
      const id = d[`${componentId}/__iri__`] as string | undefined;
      return id;
    },
    [componentId]
  );

  const lookup = useMemo(() => {
    const lookup = new Map<string, string>();
    data.forEach((d) => {
      const id = getId(d);
      const label = getLabel(d);
      lookup.set(id ?? label, label);
    });

    return lookup;
  }, [data, getId, getLabel]);

  const getValue = useCallback(
    (d: Observation) => {
      return getId(d) ?? getLabel(d);
    },
    [getId, getLabel]
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
