import * as fs from "fs";
import path from "path";

import { csvParse } from "d3-dsv";

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
      };
    });

    // Build search cubes using the buildSearchCubes function
    const searchCubes = buildSearchCubes(data);

    expect(searchCubes.slice(0, 3)).toMatchInlineSnapshot(`
      Array [
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/elcom",
            "label": "Federal Electricity Commission ElCom",
          },
          "datePublished": "2021-01-01",
          "description": "Median electricity tariff per region & consumption profiles",
          "iri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "termsets": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/prices",
              "label": "Prices",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "National economy",
            },
          ],
          "title": "Median electricity tariff per canton",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/elcom",
            "label": "Federal Electricity Commission ElCom",
          },
          "datePublished": "2021-01-01",
          "description": "Median electricity tariff for Switzerland by consumption profiles",
          "iri": "https://energy.ld.admin.ch/elcom/electricityprice-swiss",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "termsets": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/national-economy",
              "label": "National economy",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/prices",
              "label": "Prices",
            },
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
          ],
          "title": "Median electricity tariff for Switzerland",
        },
        Object {
          "creator": Object {
            "iri": "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
            "label": "Swiss Federal Office of Energy SFOE",
          },
          "datePublished": "2022-02-01",
          "description": "Der Datensatz enthält die Ergebnisse der fünf Hauptszenarien, die im Rahmen des Projekts EP2050+ erstellt wurden. Die Ergebnisse zeigen Pfade einer Weiter-wie-bisher Entwicklung auf, die einem Fortbestehen aktueller Rahmenbedingungen beruht, sowie mehrer ZERO-Szenarien, in denen auf unterschiedlichen Pfaden das Ziel erreicht wird, im Jahr 2045 netto treibhausgasneutral zu sein. Dargestellt sind die modellierten Jahreswerte der Energieverbräuche und der damit einhergehenden Treibhausgasemissionen. In den zugrundeliegenden Energiemodellen, werden diese Grössen nach den drei Dimensionen Sektor/Branche, Verwendungszweck/Anwendung und Energieträger(-gruppe) aufgeschlüsselt. Der hier veröffentlichte Datensatz entspricht nicht der feinsten Auflösungsstufe, sondern stellt die Grössen nach zwei Dimensionen aufgeschlüsselt dar, die vom Benutzer spezifizert werden können. Die folgenden sieben Darstellungsformen für Energieverbrauch/ THG-Emissionen sind möglich: * Darstellung nach Sektor und Branche * Darstellung nach Sektor und Verwendungszweck * Darstellung nach Sektor und Energieträger * Darstellung nach Verwendungszweckgruppe und Verwendungszweck * Darstellung nach Verwendungszweckgruppe und Energieträger * Darstellung nach Energieträgergruppe und Energieträger * Darstellung nach Energieträgergruppe und Verwendungszweck. Eine Auflistung der jeweiligen Ausprägungen der verschiedenen Dimensionen ist im File ogd56_catalog.csv gegeben. Die Daten sind in der Konvention angegeben, dass Energieverbräuche, -exporte und THG-Emissionen mit einem positiven Vorzeichen versehen sind, die Erzeugung eines Energieträgers, dessen Import oder die Abscheidung von Emissionen sind mit einem negative Vorzeichen versehen.",
          "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd56_energieperspektiven2050/4",
          "publicationStatus": "PUBLISHED",
          "subthemes": Array [],
          "termsets": Array [],
          "themes": Array [
            Object {
              "iri": "https://register.ld.admin.ch/opendataswiss/category/energy",
              "label": "Energy",
            },
          ],
          "title": "Modellergebnisse EP2050+: Szenario ZERO Basis, KKW-Laufzeit 50 Jahre, ausgeglichene Jahresbilanz",
        },
      ]
    `);
  });
});
