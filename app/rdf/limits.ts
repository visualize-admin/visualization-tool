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
  return (
    await Promise.all(
      dim.out(ns.cubeMeta.annotation).map(async (a) => {
        const name = a.out(ns.schema.name, { language: locale }).value ?? "";
        const ctxs = a.out(ns.cubeMeta.annotationContext);
        const baseRelated = ctxs
          .map((ctx) => {
            const dimensionIri = ctx.out(ns.sh.path).value;
            const value = ctx.out(ns.sh.hasValue).value;

            if (!dimensionIri || !value) {
              return null;
            }

            return {
              dimensionId: stringifyComponentId({
                unversionedCubeIri,
                unversionedComponentIri: dimensionIri,
              }),
              value,
            };
          })
          .filter(truthy);

        const related = await Promise.all(
          baseRelated.map(async (r) => {
            const query = `PREFIX schema: <http://schema.org/>

SELECT ?label ?position WHERE {
  VALUES ?value { <${r.value}> }
    ${buildLocalizedSubQuery("value", "schema:name", "label", {
      locale,
    })}
    ?value schema:position ?position .
}`;

            return {
              ...r,
              ...(await sparqlClient.query
                .select(query, {
                  operation: "postUrlencoded",
                })
                .then((result) => {
                  const d = result[0];
                  const label = d?.label.value;
                  const position = d?.position.value;

                  return {
                    label,
                    position,
                  };
                })),
            };
          })
        );

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
    )
  )
    .filter(truthy)
    .sort((a, b) => a.name.localeCompare(b.name));
};
