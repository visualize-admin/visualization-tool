import { CubeDimension } from "rdf-cube-view-query";

import { truthy } from "@/domain/types";
import { stringifyComponentId } from "@/graphql/make-component-id";
import * as ns from "@/rdf/namespace";

type BaseLimit = {
  name: string;
  related: {
    dimensionId: string;
    dimensionValue: string;
  }[];
};

type LimitSingle = BaseLimit & {
  type: "single";
  value: number;
};

type LimitRange = BaseLimit & {
  type: "range";
  from: number;
  to: number;
};

export type Limit = LimitSingle | LimitRange;

export const getDimensionLimits = (
  dim: CubeDimension,
  { locale, unversionedCubeIri }: { locale: string; unversionedCubeIri: string }
): Limit[] => {
  return dim
    .out(ns.cubeMeta.annotation)
    .map((a) => {
      const name = a.out(ns.schema.name, { language: locale }).value ?? "";
      const ctxs = a.out(ns.cubeMeta.annotationContext);
      const related = ctxs
        .map((ctx) => {
          const dimensionIri = ctx.out(ns.sh.path).value;
          const dimensionValue = ctx.out(ns.sh.hasValue).value;

          if (!dimensionIri || !dimensionValue) {
            return null;
          }

          return {
            dimensionId: stringifyComponentId({
              unversionedCubeIri,
              unversionedComponentIri: dimensionIri,
            }),
            dimensionValue,
          };
        })
        .filter(truthy);

      const value = a.out(ns.schema.value).value;

      if (!!value) {
        return {
          type: "single" as const,
          name,
          related,
          value: +value,
        };
      }

      const minValue = a.out(ns.schema.minValue).value;
      const maxValue = a.out(ns.schema.maxValue).value;

      if (!!minValue && !!maxValue) {
        return {
          type: "range" as const,
          name,
          related,
          from: +minValue,
          to: +maxValue,
        };
      }
    })
    .filter(truthy)
    .sort((a, b) => a.name.localeCompare(b.name));
};
