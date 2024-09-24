import * as fs from "fs";
import path from "path";

import { csvParse } from "d3-dsv";
import { Quad } from "rdf-js";

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
  it("should build search cubes from CSV (shared dimension query)", async () => {
    const data = await parseCSV(
      path.join(__dirname, "./query-search-results-shared-dimensions.mock.csv")
    );
    // Build search cubes using the buildSearchCubes function
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes.slice(0, 3)).toMatchInlineSnapshot(`
      Array [
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2022-08-16",
          "description": "Seit 2014 werden Photovoltaikanlagen mit einer Einmalvergütung (EIV) gefördert. Dabei wird abhängig von der Leistung, der Anlagenkategorie und dem Inbetriebnahmedatum ein einmaliger Beitrag an die Anlagenbetreiber ausbezahlt. Hier finden Sie pro Kanton und Auszahlungsjahr einen Überblick über die Anzahl geförderter EIV-Anlagen, die installierte Leistung in Kilowatt (kW) sowie den ausbezahlten EIV-Förderbeitrag. Die dargestellten Daten entsprechen nicht vollständig der offiziellen Statistik der erneuerbaren Energien durch das BFE. Da der Abbau der Wartelisten zeitverzögert stattfindet, können Abweichungen entstehen.",
          "dimensions": Array [
            Object {
              "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
              "label": "Kanton",
              "termsets": Array [
                Object {
                  "iri": "https://ld.admin.ch/dimension/canton",
                  "label": "Cantons",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "National economy",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
          ],
          "title": "Einmalvergütung für Photovoltaikanlagen",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2023-09-12",
          "description": "Anhaltende CO2-Wirkungen je Massnahmenbereich (Haustechnik, Wärmedämmung, Systemsanierung, Neubau, Zentrale Wärmeversorgung, Indirekte Massnahmen), seit Start des Gebäudeprogramms (berechnet auf Basis des HFM 2015)",
          "dimensions": Array [
            Object {
              "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/region",
              "label": "Region",
              "termsets": Array [
                Object {
                  "iri": "https://ld.admin.ch/dimension/country",
                  "label": "Countries",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/construction",
              "label": "Construction and housing",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/statistical-basis",
              "label": "Statistical basis",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/population",
              "label": "Population",
            },
          ],
          "title": "Gebäudeprogramm - CO2-Wirkungen je Massnahmenbereich",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2023-09-12",
          "description": "Anzahl Gesuche mit Auszahlungen im jeweiligen Jahr, Gebäudeprogramm ab 2017 (nur direkte Massnahmen)",
          "dimensions": Array [
            Object {
              "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/region",
              "label": "Kanton",
              "termsets": Array [
                Object {
                  "iri": "https://ld.admin.ch/dimension/canton",
                  "label": "Cantons",
                },
              ],
              "timeUnit": "",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/15",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/construction",
              "label": "Construction and housing",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/population",
              "label": "Population",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/statistical-basis",
              "label": "Statistical basis",
            },
          ],
          "title": "Gebäudeprogramm - Anzahl unterstützter Gesuche",
        },
      ]
    `);
  });

  it("should build search cubes from CSV (shared dimension query)", async () => {
    const data = await parseCSV(
      path.join(__dirname, "./query-search-results-temporal.mock.csv")
    );
    // Build search cubes using the buildSearchCubes function
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes.slice(0, 3)).toMatchInlineSnapshot(`
      Array [
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Bundesamt für Energie BFE",
          },
          "datePublished": "2022-02-28",
          "description": "Seit 2014 werden Photovoltaikanlagen mit einer Einmalvergütung (EIV) gefördert. Dabei wird abhängig von der Leistung, der Anlagenkategorie und dem Inbetriebnahmedatum ein einmaliger Beitrag an die Anlagenbetreiber ausbezahlt. Hier finden Sie pro Kanton und Auszahlungsjahr einen Überblick über die Anzahl geförderter EIV-Anlagen, die installierte Leistung in Kilowatt (kW) sowie den ausbezahlten EIV-Förderbeitrag. Die dargestellten Daten entsprechen nicht vollständig der offiziellen Statistik der erneuerbaren Energien durch das BFE. Da der Abbau der Wartelisten zeitverzögert stattfindet, können Abweichungen entstehen.",
          "dimensions": Array [
            Object {
              "iri": "https://energy.ld.admin.ch/sfoe/OGD84GebTest/Jahr",
              "label": "",
              "termsets": Array [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/OGD84GebTest/1",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energie",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "Volkswirtschaft",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energie",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "Volkswirtschaft",
            },
          ],
          "title": "GEB - Einmalvergütung für Photovoltaikanlagen",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Bundesamt für Energie BFE",
          },
          "datePublished": "2022-03-24",
          "description": "Die «Statistik der Wasserkraftanlagen (WASTA)» enthält Daten zu den Zentralen der schweizerischen Wasserkraftanlagen mit einer Leistung von mindestens 300 kW. Enthalten sind unter anderem technische Daten wie Leistung und Produktionserwartung.",
          "dimensions": Array [
            Object {
              "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/YearOfStatistic",
              "label": "",
              "termsets": Array [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/15",
              "label": "Wasser",
            },
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/16",
              "label": "Wirtschaft und Konsum",
            },
          ],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/territory",
              "label": "Raum und Umwelt",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energie",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/geography",
              "label": "Geographie",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/culture",
              "label": "Kultur, Medien, Informationsgesellschaft, Sport",
            },
          ],
          "title": "Statistik der Wasserkraftanlagen (WASTA)",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu",
            "label": "Bundesamt für Umwelt BAFU",
          },
          "datePublished": "2022-08-17",
          "description": "Cf. IIR report Submission 2022.",
          "dimensions": Array [
            Object {
              "iri": "https://environment.ld.admin.ch/foen/BAFU_LuChem_EMIS_pollutants_KCA_all_years/year",
              "label": "",
              "termsets": Array [],
              "timeUnit": "http://www.w3.org/2006/time#unitYear",
            },
          ],
          "iri": "https://environment.ld.admin.ch/foen/BAFU_LuChem_EMIS_pollutants_KCA_all_years/7",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/foen/theme/11",
              "label": "Luft",
            },
          ],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/territory",
              "label": "Raum und Umwelt",
            },
          ],
          "title": "Schlüsselkategorien für die wichtigsten Schadstoffe für das Einreichungsjahr 2022",
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
