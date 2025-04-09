import { PartialSearchCube } from "@/browser/dataset-browse";
import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import { ComponentId } from "@/graphql/make-component-id";

export type JoinBy = {
  // left and right are arrays because there can be multiple join by dimensions
  left: string[];
  right: string[];
};

const findDimensionForOption = (
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
  leftOptions: SearchOptions[],
  rightCube: PartialSearchCube
): JoinBy => {
  const possibleJoinBys = leftOptions
    .map((leftOption) => {
      const rightDimension = findDimensionForOption(
        leftOption,
        rightCube?.dimensions
      );
      return {
        left: leftOption.id,
        right: rightDimension?.id,
      };
    })
    .filter(
      (x): x is { left: ComponentId; right: ComponentId } =>
        !!(x.left && x.right)
    );

  return possibleJoinBys.reduce<JoinBy>(
    (acc, item) => {
      acc.left.push(item.left);
      acc.right.push(item.right);
      return acc;
    },
    { left: [], right: [] }
  );
};
