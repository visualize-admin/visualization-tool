import gql from "graphql-tag";
import { createClient } from "urql";

import { setup } from "./common";

const { test, describe, expect } = setup();

/**
 * Had to copy graphql definitions from graphql/query-hooks
 * due to problem importing rdf-js if we import the definitions
 * from graphql/query-hooks. Please keep the definitions below
 * in sync with graphql/query-hooks.
 */
export const HierarchyValueFieldsFragmentDoc = gql`
  fragment hierarchyValueFields on HierarchyValue {
    value
    dimensionIri
    depth
    label
    alternateName
    hasValue
    position
    identifier
  }
`;

export const HierarchyMetadataFragmentDoc = gql`
  fragment hierarchyMetadata on Dimension {
    hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...hierarchyValueFields
      children {
        ...hierarchyValueFields
        children {
          ...hierarchyValueFields
          children {
            ...hierarchyValueFields
            children {
              ...hierarchyValueFields
              children {
                ...hierarchyValueFields
              }
            }
          }
        }
      }
    }
  }
  ${HierarchyValueFieldsFragmentDoc}
`;

export const DimensionHierarchyDocument = gql`
  query DimensionHierarchy(
    $sourceType: String!
    $sourceUrl: String!
    $locale: String!
    $cubeIri: String!
    $dimensionIri: String!
  ) {
    dataCubeByIri(
      iri: $cubeIri
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
    ) {
      dimensionByIri(
        iri: $dimensionIri
        sourceType: $sourceType
        sourceUrl: $sourceUrl
      ) {
        ...hierarchyMetadata
      }
    }
  }
  ${HierarchyMetadataFragmentDoc}
`;

const cubeIris = {
  "C-96-r": "https://environment.ld.admin.ch/foen/nfi/C-96-r/cube/1",
  "C-96-r-multilingual":
    "https://environment.ld.admin.ch/foen/nfi/C-96-r-multilingual/cube/1",
  "C-96": "https://environment.ld.admin.ch/foen/nfi/C-96/cube/1",
  "C-96-multilingual":
    "https://environment.ld.admin.ch/foen/nfi/C-96-multilingual/cube/1",
};

const runTest = async ({
  cubeIri,
  locale,
  expected,
}: {
  cubeIri: string;
  locale: string;
  expected: { root: string; children: string[] };
}) => {
  const client = createClient({
    url: "http://localhost:3000/api/graphql",
  });
  const res = await client
    .query(DimensionHierarchyDocument, {
      cubeIri: cubeIri,
      sourceUrl: "https://int.lindas.admin.ch/query",
      sourceType: "sparql",
      dimensionIri: "https://environment.ld.admin.ch/foen/nfi/unitOfReference",
      locale,
    })
    .toPromise();
  if (res.error) {
    throw new Error(`${res.error.name}: ${res.error.message}`);
  }
  const dimension = res.data.dataCubeByIri.dimensionByIri;
  const {
    hierarchy: [{ label, children }],
  } = dimension;
  expect(label).toBe(expected.root);
  expect(children.map((x) => x.label)).toEqual(expected.children);
};

/**
 * @todo Test works locally but not on CI
 */
const testFn = process.env.CI ? test.skip : test;

describe("multi root hierarchy retrieval", () => {
  testFn("should work for C-96", async () => {
    await runTest({
      cubeIri: cubeIris["C-96"],
      locale: "en",
      expected: {
        root: "Switzerland",
        children: [
          "Production region - Economic Region",
          "Canton",
          "Protection Forest region - Economic Region",
        ],
      },
    });
  });

  /**
   * Tests below are skipped since cubes seem to have changed
   * @see https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/c96-cubes/near/321453
   */
  test.skip("should work for C-96-r", async () => {
    await runTest({
      cubeIri: cubeIris["C-96-r"],
      locale: "de",
      expected: {
        root: "Schweiz",
        children: [
          "Kanton",
          "Produktionsregion - Wirtschaftsregion",
          "Schutzwaldregion - Wirtschaftsregion",
        ],
      },
    });
  });

  test.skip("should work for C-96-r-multilingual", async ({}) => {
    await runTest({
      cubeIri: cubeIris["C-96-r-multilingual"],
      locale: "en",
      expected: {
        root: "Switzerland",
        children: [
          "Canton",
          "Production region - Economic region",
          "Protection Forest region - Economic region",
        ],
      },
    });
  });

  test.skip("should work for C-96-multilingual", async () => {
    await runTest({
      cubeIri: cubeIris["C-96-multilingual"],
      locale: "en",
      expected: {
        root: "Switzerland",
        children: ["Canton", "Production region", "Protection Forest region"],
      },
    });
  });
});
