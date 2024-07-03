import { createClient } from "urql";

import {
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
} from "../app/graphql/query-hooks";

import { setup } from "./common";

const { test, expect } = setup();

const cubeIri = "https://environment.ld.admin.ch/foen/BFS_cofog_national/2";
const versionedDimensionIri =
  "https://environment.ld.admin.ch/foen/BFS_cofog_national/sector";

test("@noci it should be possible to query dimension values from versioned dimension correctly", async ({
  page,
}) => {
  await page.goto("/");
  const pageUrl = page.url().split("?")[0]; // remove query params
  const client = createClient({ url: pageUrl + "/api/graphql" });
  const { data, error } = await client
    .query<DataCubeComponentsQuery, DataCubeComponentsQueryVariables>(
      DataCubeComponentsDocument,
      {
        sourceType: "sparql",
        sourceUrl: "https://lindas.admin.ch/query",
        locale: "en",
        cubeFilter: { iri: cubeIri, loadValues: true },
      }
    )
    .toPromise();

  expect(error).toBe(undefined);
  const identifiers = (
    data?.dataCubeComponents?.dimensions?.find(
      (d) => d.iri === versionedDimensionIri
    )?.values ?? []
  ).map((v) => v.identifier);

  expect(
    identifiers.length,
    "There should be some identifiers."
  ).toBeGreaterThan(0);
  expect(
    identifiers.every((i) => typeof i === "string"),
    "Every identifier must be a string."
  ).toBe(true);
  expect
    .soft(
      identifiers,
      "The identifiers should be equal to this list; except if the cube has been updated."
    )
    .toMatchObject(["S13", "S1311", "S1312", "S1313", "S1314"]);
});
