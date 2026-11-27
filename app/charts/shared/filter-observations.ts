import { Observation } from "@/domain/data";

export const filterObservations = (
  observations: Observation[],
  predicates: ((observation: Observation) => boolean)[]
) => {
  return predicates.length > 0
    ? observations.filter((d) => predicates.every((predicate) => predicate(d)))
    : observations;
};
