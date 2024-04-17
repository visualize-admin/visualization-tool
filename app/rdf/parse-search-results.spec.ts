import * as fs from "fs";
import path from "path";

import { csvParse } from "d3-dsv";
import { Quad } from "rdf-js";

import { buildSearchCubes } from "./parse-search-results";

describe("parse-search-results", () => {
  it("should build search cubes from CSV", () => {
    // Read the CSV file
    const csvData = fs.readFileSync(
      // File was downloaded from Lindas
      path.join(__dirname, "./query-search-results.mock.csv"),
      "utf8"
    );

    // Parse the rows into subject, predicate, and object
    const rows = csvParse(csvData).slice(1);
    const data = rows.map((row) => {
      return {
        subject: { value: row.subject! },
        predicate: { value: row.predicate! },
        object: { value: row.object! },
      } as Quad;
    });

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
            },
          ],
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
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
});
