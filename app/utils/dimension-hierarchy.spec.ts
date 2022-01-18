import { DocumentNode } from "graphql";
import { Client } from "urql";
import {
  DataCubeObservationsDocument,
  DimensionValuesDocument,
  DimensionValuesQueryVariables,
} from "../graphql/query-hooks";
import { default as observationsFixture } from "../test/__fixtures/api/bathingsite-observations.json";
import { default as monitoringProgramValuesFixture } from "../test/__fixtures/api/ubd0104_monitoringprogramm.json";
import { default as bathingSiteValuesFixture } from "../test/__fixtures/api/ubd0104_station.json";
import {
  DimensionHierarchy,
  fetchDimensionValuesTree,
  getHierarchyDimensionPath,
} from "./dimension-hierarchy";

const MONITOR_PROGRAM_IRI =
  "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm";

const BATHING_SITE_IRI = "https://environment.ld.admin.ch/foen/ubd0104/station";
const hierarchy = [
  {
    dimensionIri: MONITOR_PROGRAM_IRI,
    children: [
      {
        dimensionIri: BATHING_SITE_IRI,
        children: [],
      },
    ],
  },
] as DimensionHierarchy[];

describe("getHierarchyDimensionPath", () => {
  it("should return the full path to the hierarchy", () => {
    expect(getHierarchyDimensionPath(BATHING_SITE_IRI, hierarchy)).toEqual([
      MONITOR_PROGRAM_IRI,
      BATHING_SITE_IRI,
    ]);
    expect(getHierarchyDimensionPath(MONITOR_PROGRAM_IRI, hierarchy)).toEqual([
      MONITOR_PROGRAM_IRI,
    ]);
    expect(
      getHierarchyDimensionPath("https://fake-dimension-iri", hierarchy)
    ).toEqual(["https://fake-dimension-iri"]);
  });
});

describe("fetchHierarchy", () => {
  it("should work", async () => {
    const hierarchy = [
      {
        dimensionIri:
          "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm",
        children: [
          {
            dimensionIri:
              "https://environment.ld.admin.ch/foen/ubd0104/station",
            children: [],
          },
        ],
      },
    ] as DimensionHierarchy[];
    const dataSetIri = "https://environment.ld.admin.ch/foen/ubd0104/4/";
    const dimensionIri = BATHING_SITE_IRI;
    const client = {
      query: (doc: DocumentNode, vars: DimensionValuesQueryVariables) => ({
        toPromise: () => {
          if (doc === DimensionValuesDocument) {
            console.log(vars);
            if (vars.dimensionIri === MONITOR_PROGRAM_IRI) {
              return monitoringProgramValuesFixture;
            } else if (vars.dimensionIri === BATHING_SITE_IRI) {
              return bathingSiteValuesFixture;
            } else {
              throw new Error(
                `No dimension values fixture for ${vars.dimensionIri}`
              );
            }
          } else if (doc === DataCubeObservationsDocument) {
            return observationsFixture;
          }
          console.warn(
            "Unsupported query document during tests, please see mocked client::query method",
            doc
          );
          throw new Error("Unsupported doc in tests");
        },
      }),
    } as unknown as Client;
    const locale = "en";
    const tree = await fetchDimensionValuesTree({
      dataSetIri,
      dimensionIri,
      hierarchy,
      client,
      locale,
      sorters: {
        [MONITOR_PROGRAM_IRI]: ({ value }) => value,
        [BATHING_SITE_IRI]: ({ label }) => label,
      },
    });
    expect(tree.length).toBe(4);
    expect(tree[0].label).toEqual("BAQUA_AG");
    expect(tree[0].children).toEqual([
      {
        children: [],
        depth: 1,
        dimensionIri: "https://environment.ld.admin.ch/foen/ubd0104/station",
        label: "Badi Tennwil",
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19006",
      },
      {
        children: [],
        depth: 1,
        dimensionIri: "https://environment.ld.admin.ch/foen/ubd0104/station",
        label: "Seerose",
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19007",
      },
      {
        children: [],
        depth: 1,
        dimensionIri: "https://environment.ld.admin.ch/foen/ubd0104/station",
        label: "Vor Badi",
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19004",
      },
    ]);
  });
});
