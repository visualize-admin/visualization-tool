// eslint-disable-next-line no-restricted-imports
import { groupBy, mapValues } from "lodash";

import { PartialSearchCube } from "@/browser/dataset-browse";
import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import { truthy } from "@/domain/types";
import { ComponentId, parseComponentId } from "@/graphql/make-component-id";

// cubeIri to dimensionIds
export type JoinBy = Record<string, ComponentId[]>;

export const findDimensionForOption = (
  option: SearchOptions,
  dimensions: PartialSearchCube["dimensions"]
) => {
  const type = option.type;
  switch (type) {
    case "temporal":
      return dimensions?.find(
        (d) =>
          // TODO Find out why this is necessary
          d.timeUnit === `http://www.w3.org/2006/time#unit${option.timeUnit}`
      );
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
): JoinBy => {
  const tmp = options.map((option) => {
    const rightDimension = findDimensionForOption(option, newCube?.dimensions);
    if (!rightDimension) {
      console.log("No dimension found for option", option);
      return {};
    } else {
      console.log("Found dimension", JSON.stringify(rightDimension, null, 2));
    }

    const originalIdsByCube = groupBy(option.originalIds, (x) => {
      return x.cubeIri;
    });
    return {
      ...mapValues(originalIdsByCube, (x) => x.map((x) => x.dimensionId)),
      [newCube.iri]: [rightDimension?.id].filter(truthy),
    };
  });

  console.log(JSON.stringify({ tmp }, null, 2));

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
  }, {} as JoinBy);

  return result;
};
