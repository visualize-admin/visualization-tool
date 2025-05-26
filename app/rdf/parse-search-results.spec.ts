import * as fs from "fs";
import path from "path";

import { csvParse } from "d3-dsv";
import { Quad } from "rdf-js";
import { describe, expect, it } from "vitest";

import { SearchCube } from "@/domain/data";
import { mergeSearchCubes } from "@/rdf/query-search";

import { buildSearchCubes } from "./parse-search-results";

const parseCSV = async (filepath: string) => {
  // Read the CSV file
  const csvData = fs.readFileSync(
    // File was downloaded from Lindas
    filepath,
    "utf8"
  );

  // Parse the rows into subject, predicate, and object
  const rows = csvParse(csvData);
  return rows.map((row) => {
    return {
      subject: { value: row.subject! },
      predicate: { value: row.predicate! },
      object: { value: row.object! },
    } as Quad;
  });
};

describe("parse-search-results", () => {
  it("should correctly parse cube", async () => {
    const data = await parseCSV(
      path.join(
        __dirname,
        "./query-search-results-photovoltaikanlagen.mock.csv"
      )
    );
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes).toMatchInlineSnapshot(`
      [
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2022-08-16",
          "description": "Seit 2014 werden Photovoltaikanlagen mit einer Einmalvergütung (EIV) gefördert. Dabei wird abhängig von der Leistung, der Anlagenkategorie und dem Inbetriebnahmedatum ein einmaliger Beitrag an die Anlagenbetreiber ausbezahlt. Hier finden Sie pro Kanton und Auszahlungsjahr einen Überblick über die Anzahl geförderter EIV-Anlagen, die installierte Leistung in Kilowatt (kW) sowie den ausbezahlten EIV-Förderbeitrag. Die dargestellten Daten entsprechen nicht vollständig der offiziellen Statistik der erneuerbaren Energien durch das BFE. Da der Abbau der Wartelisten zeitverzögert stattfindet, können Abweichungen entstehen.",
          "dimensions": undefined,
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [
            {
              "iri": "https://ld.admin.ch/dimension/office",
              "label": "Federal Offices",
            },
            {
              "iri": "https://ld.admin.ch/dimension/canton",
              "label": "Cantons",
            },
          ],
          "themes": [
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "National economy",
            },
          ],
          "title": "Einmalvergütung für Photovoltaikanlagen",
          "unversionedIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
        },
      ]
    `);
  });

  it("should build search cubes from CSV (shared dimension query, all)", async () => {
    const data = await parseCSV(
      path.join(__dirname, "./query-search-results-shared-dimensions.mock.csv")
    );
    // Build search cubes using the buildSearchCubes function
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes.slice(0, 3)).toMatchInlineSnapshot(`
      [
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/elcom",
            "label": "Federal Electricity Commission ElCom",
          },
          "datePublished": "2021-01-01",
          "description": "Median electricity tariff per region & consumption profiles",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
              "label": "Canton",
              "termsets": [
                {
                  "iri": "https://ld.admin.ch/dimension/canton",
                  "label": "Cantons",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [],
          "themes": [],
          "title": "Median electricity tariff per canton",
          "unversionedIri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        },
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2022-08-16",
          "description": "Seit 2014 werden Photovoltaikanlagen mit einer Einmalvergütung (EIV) gefördert. Dabei wird abhängig von der Leistung, der Anlagenkategorie und dem Inbetriebnahmedatum ein einmaliger Beitrag an die Anlagenbetreiber ausbezahlt. Hier finden Sie pro Kanton und Auszahlungsjahr einen Überblick über die Anzahl geförderter EIV-Anlagen, die installierte Leistung in Kilowatt (kW) sowie den ausbezahlten EIV-Förderbeitrag. Die dargestellten Daten entsprechen nicht vollständig der offiziellen Statistik der erneuerbaren Energien durch das BFE. Da der Abbau der Wartelisten zeitverzögert stattfindet, können Abweichungen entstehen.",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
              "label": "Kanton",
              "termsets": [
                {
                  "iri": "https://ld.admin.ch/dimension/canton",
                  "label": "Cantons",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [],
          "themes": [
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "National economy",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
          ],
          "title": "Einmalvergütung für Photovoltaikanlagen",
          "unversionedIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
        },
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2023-09-12",
          "description": "Anhaltende CO2-Wirkungen je Massnahmenbereich (Haustechnik, Wärmedämmung, Systemsanierung, Neubau, Zentrale Wärmeversorgung, Indirekte Massnahmen), seit Start des Gebäudeprogramms (berechnet auf Basis des HFM 2015)",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/region",
              "label": "Region",
              "termsets": [
                {
                  "iri": "https://ld.admin.ch/dimension/country",
                  "label": "Countries",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [],
          "themes": [
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/construction",
              "label": "Construction and housing",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/statistical-basis",
              "label": "Statistical basis",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/population",
              "label": "Population",
            },
          ],
          "title": "Gebäudeprogramm - CO2-Wirkungen je Massnahmenbereich",
          "unversionedIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4",
        },
      ]
    `);
  });

  it("should build search cubes from CSV (shared dimension query, temporal)", async () => {
    const data = await parseCSV(
      path.join(__dirname, "./query-search-results-temporal.mock.csv")
    );
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes.slice(0, 3)).toMatchInlineSnapshot(`
      [
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/elcom",
            "label": "Eidgenössische Elektrizitätskommission ElCom",
          },
          "datePublished": "2021-01-01",
          "description": "Strompreise per Stromnetzbetreiber und Gemeinde in der Schweiz",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/elcom/electricityprice(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
              "label": "",
              "termsets": [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://energy.ld.admin.ch/elcom/electricityprice",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [],
          "themes": [],
          "title": "Strompreis per Stromnetzbetreiber",
          "unversionedIri": "https://energy.ld.admin.ch/elcom/electricityprice",
        },
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Bundesamt für Energie BFE",
          },
          "datePublished": "2022-02-28",
          "description": "Seit 2014 werden Photovoltaikanlagen mit einer Einmalvergütung (EIV) gefördert. Dabei wird abhängig von der Leistung, der Anlagenkategorie und dem Inbetriebnahmedatum ein einmaliger Beitrag an die Anlagenbetreiber ausbezahlt. Hier finden Sie pro Kanton und Auszahlungsjahr einen Überblick über die Anzahl geförderter EIV-Anlagen, die installierte Leistung in Kilowatt (kW) sowie den ausbezahlten EIV-Förderbeitrag. Die dargestellten Daten entsprechen nicht vollständig der offiziellen Statistik der erneuerbaren Energien durch das BFE. Da der Abbau der Wartelisten zeitverzögert stattfindet, können Abweichungen entstehen.",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/sfoe/OGD84GebTest/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/OGD84GebTest/Jahr",
              "label": "",
              "termsets": [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/OGD84GebTest/1",
          "publicationStatus": "PUBLISHED",
          "subthemes": [],
          "termsets": [],
          "themes": [
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energie",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "Volkswirtschaft",
            },
          ],
          "title": "GEB - Einmalvergütung für Photovoltaikanlagen",
          "unversionedIri": "https://energy.ld.admin.ch/sfoe/OGD84GebTest/1",
        },
        {
          "creator": {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Bundesamt für Energie BFE",
          },
          "datePublished": "2022-03-24",
          "description": "Die «Statistik der Wasserkraftanlagen (WASTA)» enthält Daten zu den Zentralen der schweizerischen Wasserkraftanlagen mit einer Leistung von mindestens 300 kW. Enthalten sind unter anderem technische Daten wie Leistung und Produktionserwartung.",
          "dimensions": [
            {
              "id": "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/YearOfStatistic",
              "label": "",
              "termsets": [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7",
          "publicationStatus": "PUBLISHED",
          "subthemes": [
            {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
          ],
          "termsets": [],
          "themes": [
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/territory",
              "label": "Raum und Umwelt",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energie",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/geography",
              "label": "Geographie",
            },
            {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/culture",
              "label": "Kultur, Medien, Informationsgesellschaft, Sport",
            },
          ],
          "title": "Statistik der Wasserkraftanlagen (WASTA)",
          "unversionedIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7",
        },
      ]
`);
  });
});

it("should merge search cubes together", async () => {
  const cubesShared = buildSearchCubes(
    await parseCSV(
      path.join(__dirname, "./query-search-results-shared-dimensions.mock.csv")
    )
  );
  const cubesTemporal = buildSearchCubes(
    await parseCSV(
      path.join(__dirname, "./query-search-results-temporal.mock.csv")
    )
  );
  const searchCubes = Object.values(
    [...cubesShared, ...cubesTemporal].reduce(
      (acc, d) => {
        acc[d.iri] = mergeSearchCubes(acc[d.iri], d);
        return acc;
      },
      {} as Record<string, SearchCube>
    )
  );
  const cubeWithTemporalAndShared = searchCubes.some((cube) => {
    const temporal = cube.dimensions?.find((dimension) => dimension.timeUnit);
    const shared = cube.dimensions?.find(
      (dimension) => dimension.termsets.length
    );
    return temporal && shared;
  });
  expect(cubeWithTemporalAndShared).toBe(true);
});
