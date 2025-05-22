import { CubeDimension } from "rdf-cube-view-query";
import ParsingClient from "sparql-http-client/ParsingClient";

import { DimensionValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { stringifyComponentId } from "@/graphql/make-component-id";
import * as ns from "@/rdf/namespace";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

type BaseLimit = {
  name: string;
  related: Related[];
};

type Related = {
  type: "single" | "time-from" | "time-to";
  dimensionId: string;
  value: string;
} & Pick<DimensionValue, "label" | "position">;

export type LimitSingle = BaseLimit & {
  type: "single";
  value: number;
};

export type LimitValueRange = BaseLimit & {
  type: "value-range";
  min: number;
  max: number;
};

export type LimitTimeRange = BaseLimit & {
  type: "time-range";
  value: number;
};

export type Limit = LimitSingle | LimitValueRange | LimitTimeRange;

export const getDimensionLimits = async (
  dim: CubeDimension,
  {
    locale,
    unversionedCubeIri,
    sparqlClient,
  }: { locale: string; unversionedCubeIri: string; sparqlClient: ParsingClient }
): Promise<Limit[]> => {
  const baseLimits = dim
    .out(ns.cubeMeta.annotation)
    .map((a, index) => {
      const name = a.out(ns.schema.name, { language: locale }).value ?? "";
      const ctxs = a.out(ns.cubeMeta.annotationContext);
      let isTimeRange = false;

      const related = ctxs
        .map((ctx) => {
          const dimensionIri = ctx.out(ns.sh.path).value;
          const value = ctx.out(ns.sh.hasValue).value;
          const minInclusive = ctx.out(ns.sh.minInclusive).value;
          const maxInclusive = ctx.out(ns.sh.maxInclusive).value;

          if (!dimensionIri) {
            return null;
          }

          const dimensionId = stringifyComponentId({
            unversionedCubeIri,
            unversionedComponentIri: dimensionIri,
          });

          if (value) {
            return [{ type: "single", dimensionIri, dimensionId, value }];
          }

          if (minInclusive && maxInclusive) {
            isTimeRange = true;

            return [
              {
                type: "time-from",
                dimensionIri,
                dimensionId,
                value: minInclusive,
              },
              {
                type: "time-to",
                dimensionIri,
                dimensionId,
                value: maxInclusive,
              },
            ];
          }
        })
        .filter(truthy)
        .flat();

      const value = a.out(ns.schema.value).value;

      if (value) {
        const type = isTimeRange
          ? ("time-range" as const)
          : ("single" as const);

        return {
          index,
          related,
          limit: {
            type,
            name,
            value: +value,
          },
        };
      }

      const minValue = a.out(ns.schema.minValue).value;
      const maxValue = a.out(ns.schema.maxValue).value;

      if (minValue && maxValue) {
        return {
          index,
          related,
          limit: {
            type: "value-range" as const,
            name,
            min: +minValue,
            max: +maxValue,
          },
        };
      }
    })
    .filter(truthy)
    .sort((a, b) => a.limit.name.localeCompare(b.limit.name));

  const baseRelated = baseLimits.flatMap((l) =>
    l.related.map((r) => ({ ...r, index: l.index }))
  );

  if (baseRelated.length > 0) {
    const allRelatedQuery = `PREFIX schema: <http://schema.org/>

    SELECT ?index ?type ?dimensionIri ?value ?label ?position WHERE {
      VALUES (?index ?type ?dimensionIri ?value) { ${baseLimits
        .flatMap((l) => l.related.map((r) => ({ ...r, index: l.index })))
        .map((r) => `(${r.index} "${r.type}" <${r.dimensionIri}> <${r.value}>)`)
        .join(" ")} }
        ${buildLocalizedSubQuery("value", "schema:name", "label", {
          locale,
        })}
        OPTIONAL { ?value schema:position ?position . }
    }`;

    const allRelated = (
      await sparqlClient.query.select(allRelatedQuery, {
        operation: "postUrlencoded",
      })
    ).map((d) => {
      const index = +d.index.value;
      const type = d.type.value as Related["type"];
      const dimensionIri = d.dimensionIri.value;
      const value = d.value.value;
      const label = d.label?.value;
      const position = d.position?.value;

      return {
        index,
        type,
        dimensionId: stringifyComponentId({
          unversionedCubeIri,
          unversionedComponentIri: dimensionIri,
        }),
        value,
        label,
        position,
      };
    });

    return baseLimits.map(({ index, limit }) => {
      return {
        ...limit,
        related: allRelated.filter((r) => r.index === index),
      };
    });
  } else {
    return baseLimits.map(({ limit }) => {
      return {
        ...limit,
        related: [],
      };
    });
  }
};
