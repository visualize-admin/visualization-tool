import { CubeDimension } from "rdf-cube-view-query";
import ParsingClient from "sparql-http-client/ParsingClient";

import { DimensionValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { stringifyComponentId } from "@/graphql/make-component-id";
import * as ns from "@/rdf/namespace";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

type BaseLimit = {
  name: string;
  related: ({
    dimensionId: string;
    value: string;
  } & Pick<DimensionValue, "label" | "position">)[];
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
      const related = ctxs
        .map((ctx) => {
          const dimensionIri = ctx.out(ns.sh.path).value;
          const value = ctx.out(ns.sh.hasValue).value;
          const minInclusive = ctx.out(ns.sh.minInclusive).value;
          const maxInclusive = ctx.out(ns.sh.maxInclusive).value;

          if (!dimensionIri) {
            return null;
          }

          return {
            ctx,
            dimensionId: stringifyComponentId({
              unversionedCubeIri,
              unversionedComponentIri: dimensionIri,
            }),
            value,
            minInclusive,
            maxInclusive,
          };
        })
        .filter(truthy);

      // We do not support range limits yet.
      if (related.some((r) => !!r.minInclusive || !!r.maxInclusive)) {
        return null;
      }

      const value = a.out(ns.schema.value).value;

      // Temporary, until we support range limits.
      const relatedWithoutInclusive = related.map(
        ({ minInclusive, maxInclusive, ...r }) => r
      );

      if (!!value) {
        return {
          index,
          related: relatedWithoutInclusive,
          limit: {
            type: "single" as const,
            name,
            value: +value,
          },
        };
      }

      const minValue = a.out(ns.schema.minValue).value;
      const maxValue = a.out(ns.schema.maxValue).value;

      if (!!minValue && !!maxValue) {
        return {
          index,
          related: relatedWithoutInclusive,
          limit: {
            type: "range" as const,
            name,
            from: +minValue,
            to: +maxValue,
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

    SELECT ?index ?dimensionId ?value ?label ?position WHERE {
      VALUES (?index ?dimensionId ?value) { ${baseLimits
        .flatMap((l) => l.related.map((r) => ({ ...r, index: l.index })))
        .map((r) => `(${r.index} <${r.dimensionId}> <${r.value}>)`)
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
      const dimensionId = d.dimensionId.value;
      const value = d.value.value;
      const label = d.label.value;
      const position = d.position.value;

      return {
        index,
        dimensionId,
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
