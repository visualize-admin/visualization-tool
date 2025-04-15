// eslint-disable-next-line no-restricted-imports
import { groupBy, mapValues } from "lodash";

import { isDimensionOfTimeUnit, PartialSearchCube } from "@/domain/data";
import { truthy } from "@/domain/types";
import { mkVersionedJoinBy, VersionedJoinBy } from "@/graphql/join";

import { SearchOptions } from "./types";

export const findDimensionForOption = (
  option: SearchOptions,
  dimensions: PartialSearchCube["dimensions"]
) => {
  const type = option.type;
  switch (type) {
    case "temporal":
      return dimensions?.find((d) => isDimensionOfTimeUnit(d, option.timeUnit));
    case "shared":
      return dimensions?.find((d) =>
        d.termsets.some((t) =>
          option.termsets.map((t) => t.iri).includes(t.iri)
        )
      );
    default:
      const exhaustiveCheck: never = type;
      return exhaustiveCheck;
  }
};

export const inferJoinBy = (
  options: SearchOptions[],
  newCube: PartialSearchCube
): VersionedJoinBy => {
  const tmp = options.map((option) => {
    const rightDimension = findDimensionForOption(option, newCube?.dimensions);
    if (!rightDimension) {
      console.log("No dimension found for option", option);
      return {};
    }

    const originalIdsByCube = groupBy(option.originalIds, (x) => {
      return x.cubeIri;
    });
    return {
      ...mapValues(originalIdsByCube, (x) => x.map((x) => x.dimensionId)),
      [newCube.iri]: [rightDimension?.id].filter(truthy),
    };
  });

  const result = tmp.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      if (value) {
        acc[key].push(...value);
      }
    });
    return acc;
  }, {} as VersionedJoinBy);

  return mkVersionedJoinBy(result);
};
