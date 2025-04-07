import { PartialSearchCube } from "@/browser/dataset-browse";
import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import { ComponentId } from "@/graphql/make-component-id";

export type JoinBy = {
  // left and right are arrays because there can be multiple join by dimensions
  left: string[];
  right: string[];
};

export const inferJoinBy = (
  leftOptions: SearchOptions[],
  rightCube: PartialSearchCube
): JoinBy => {
  const possibleJoinBys = leftOptions
    .map((leftOption) => {
      const type = leftOption.type;
      // For every selected dimension, we need to find the corresponding dimension on the other cube
      switch (type) {
        case "temporal":
          return {
            left: leftOption.id,
            right: rightCube?.dimensions?.find(
              (d) =>
                // TODO Find out why this is necessary
                d.timeUnit ===
                `http://www.w3.org/2006/time#unit${leftOption.timeUnit}`
            )?.id,
          };
        case "shared":
          return {
            left: leftOption.id,
            right: rightCube?.dimensions?.find((d) =>
              d.termsets.some((t) =>
                leftOption.termsets.map((t) => t.iri).includes(t.iri)
              )
            )?.id,
          };
        default:
          const exhaustiveCheck: never = type;
          return exhaustiveCheck;
      }
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
