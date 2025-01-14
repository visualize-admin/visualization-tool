import { group } from "d3-array";
import { Quad } from "rdf-js";

import { SearchCube } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import * as ns from "@/rdf/namespace";
import { GROUP_SEPARATOR } from "@/rdf/query-utils";

const visualizePredicates = {
  hasDimension: ns.visualizeAdmin`hasDimension`.value,
  hasTermset: ns.visualizeAdmin`hasTermset`.value,
  hasTimeUnit: ns.visualizeAdmin`hasTimeUnit`.value,
  hasThemeIris: ns.visualizeAdmin`hasThemeIris`.value,
  hasThemeLabels: ns.visualizeAdmin`hasThemeLabels`.value,
};

function buildSearchCubes(
  quads: Pick<Quad, "predicate" | "object" | "subject">[]
): SearchCube[] {
  const byPredicateAndObject = group(
    quads,
    (x) => x.predicate.value,
    (x) => x.object.value
  );
  const bySubjectAndPredicate = group(
    quads,
    (x) => x.subject.value,
    (x) => x.predicate.value
  );
  const iriList =
    byPredicateAndObject
      .get("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
      ?.get("https://cube.link/Cube")
      ?.map((x) => x.subject.value) ?? [];

  const searchCubes: SearchCube[] = [];

  for (const iri of iriList) {
    const cubeQuads = bySubjectAndPredicate.get(iri);
    if (cubeQuads) {
      const unversionedIri =
        cubeQuads.get(ns.schema.hasPart.value)?.[0].object.value ?? iri;
      const themeQuads = cubeQuads.get(visualizePredicates.hasThemeIris)?.[0];
      const themeIris = themeQuads?.object.value.split(GROUP_SEPARATOR);
      const themeLabelQuads = cubeQuads.get(visualizePredicates.hasThemeLabels)?.[0];
      const themeLabels = themeLabelQuads?.object.value.split(GROUP_SEPARATOR);
      const subthemesQuads = cubeQuads.get(ns.schema.about.value);
      const dimensions = cubeQuads.get(visualizePredicates.hasDimension);
      const creatorIri = cubeQuads.get(ns.schema.creator.value)?.[0]?.object
        .value;
      const publicationStatus = cubeQuads.get(
        ns.schema.creativeWorkStatus.value
      )?.[0].object.value;
      const termsetQuads = byPredicateAndObject
        .get("https://cube.link/meta/isUsedIn")
        ?.get(iri);

      const cubeSearchCube: SearchCube = {
        iri,
        unversionedIri,
        title: cubeQuads.get(ns.schema.name.value)?.[0].object.value ?? "",
        description:
          cubeQuads.get(ns.schema.description.value)?.[0].object.value ?? null,
        publicationStatus:
          publicationStatus ===
          ns.adminVocabulary("CreativeWorkStatus/Published").value
            ? DataCubePublicationStatus.Published
            : DataCubePublicationStatus.Draft,
        datePublished:
          cubeQuads.get(ns.schema.datePublished.value)?.[0].object.value ??
          null,
        creator: creatorIri
          ? {
              iri: creatorIri,
              label:
                bySubjectAndPredicate
                  .get(creatorIri)
                  ?.get(ns.schema.name.value)?.[0].object.value ?? "",
            }
          : null,
        themes:
          themeIris?.map((iri, i) => {
            return {
              iri,
              label: themeLabels?.[i] ?? "",
            };
          }) ?? [],
        subthemes:
          subthemesQuads?.map((x) => {
            return {
              iri: x.object.value,
              label:
                bySubjectAndPredicate
                  .get(x.object.value)
                  ?.get(ns.schema.name.value)?.[0].object.value ?? "",
            };
          }) ?? [],
        termsets:
          termsetQuads?.map((x) => {
            return {
              iri: x.subject.value,
              label:
                bySubjectAndPredicate
                  .get(x.subject.value)
                  ?.get(ns.schema.name.value)?.[0].object.value ?? "",
            };
          }) ?? [],
        dimensions: dimensions?.map((x) => {
          const dim = bySubjectAndPredicate.get(x.object.value);
          return {
            id: stringifyComponentId({
              unversionedCubeIri: unversionedIri,
              unversionedComponentIri: x.object.value,
            }),
            label: dim?.get(ns.schema.name.value)?.[0].object.value ?? "",
            timeUnit:
              dim?.get(visualizePredicates.hasTimeUnit)?.[0].object.value ?? "",
            termsets:
              dim?.get(visualizePredicates.hasTermset)?.map((x) => {
                return {
                  iri: x.object.value,
                  label:
                    bySubjectAndPredicate
                      .get(x.object.value)
                      ?.get(ns.schema.name.value)?.[0].object.value ?? "",
                };
              }) ?? [],
          };
        }),
      };

      searchCubes.push(cubeSearchCube);
    }
  }

  return searchCubes;
}

export { buildSearchCubes };
