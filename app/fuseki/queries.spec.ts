import fs from "fs";
import path from "path";

import mapValues from "lodash/mapValues";
import { Parser, Writer } from "n3";
import fetch from "node-fetch";

const STARDOG_URL = "https://lindas-cached.cluster.ldbar.ch";
const FUSEKI_URL = "http://localhost:3030/dataset";

const results = new Map<string, Map<string, string>>();
const saveResults = (filename: string) => {
  const resultsJson = JSON.stringify(
    Array.from(results.entries()).map(([baseUrl, queries]) => [
      baseUrl,
      Array.from(queries.entries()).map(([query, result]) => [query, result]),
    ]),
    null,
    2
  );
  fs.writeFileSync(filename, resultsJson);
};
const loadResults = (filename: string) => {
  if (!fs.existsSync(filename)) {
    return;
  }
  try {
    const resultsJson = fs.readFileSync(filename, "utf8");
    const resultsArray = JSON.parse(resultsJson);
    resultsArray.forEach(([baseUrl, queries]) => {
      results.set(baseUrl, new Map(queries));
    });
  } catch (e) {
    console.log("Error loading results", e);
    return;
  }
};
beforeAll(() => {
  loadResults("/tmp/results.json");
});
afterAll(() => {
  saveResults("/tmp/results.json");
});

const sparqlQuery = async (baseUrl: string, query: string) => {
  if (!results.has(baseUrl)) {
    results.set(baseUrl, new Map<string, string>());
  }
  if (results.get(baseUrl)!.has(query)) {
    console.log("returning cached result");
    return results.get(baseUrl)!.get(query);
  }
  const headers = {
    "Content-Type": "application/sparql-query",
    Accept:
      queryType(query) === "SELECT"
        ? "application/sparql-results+json"
        : // turtle for CONSTRUCT and DESCRIBE
          "text/turtle",
  };
  const response = await fetch(`${baseUrl}/query`, {
    method: "POST",
    headers,
    body: query,
  });
  const text = await response.text();
  results.get(baseUrl)!.set(query, text);
  return text;
};

const QUERY_TEXTS_FOLDER = path.join(__dirname, "query-texts");

const squash = (str: string) => str.replace(/ +/g, " ");

const querySummary = (query_: string) => {
  const query = squash(query_.replace(/\n/g, " "));
  const selectIndex = query.indexOf("SELECT");
  const constructIndex = query.indexOf("CONSTRUCT");
  const describeIndex = query.indexOf("DESCRIBE");
  const index = Math.max(selectIndex, constructIndex, describeIndex);
  return squash(query.slice(index, index + 50));
};

const queryType = (query: string) => {
  const selectIndex = query.includes("SELECT")
    ? query.indexOf("SELECT")
    : Infinity;
  const constructIndex = query.includes("CONSTRUCT")
    ? query.indexOf("CONSTRUCT")
    : Infinity;
  const describeIndex = query.includes("DESCRIBE")
    ? query.indexOf("DESCRIBE")
    : Infinity;
  const index = Math.min(selectIndex, constructIndex, describeIndex);
  if (selectIndex === index) {
    return "SELECT";
  } else if (constructIndex === index) {
    return "CONSTRUCT";
  } else if (describeIndex === index) {
    return "DESCRIBE";
  }
  throw new Error("Unknown query type");
};

const sortedKeys = (obj: Record<string, any>) => {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
};

describe("SPARQL Query Tests", () => {
  const files = fs.readdirSync(QUERY_TEXTS_FOLDER);
  const queries = files.map((filename) => {
    const filePath = path.join(QUERY_TEXTS_FOLDER, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return [filename, fileContent];
  });

  queries.forEach(([filename, query]) => {
    let focus = "";
    // focus = "e812f175a7d75954ae71864180bd52544d78b478.sparql.txt";
    if (focus && filename !== focus) {
      return;
    }
    test(`Query test for ${filename} - ${querySummary(query)}`, async () => {
      console.log(query);
      const fusekiResponse = await sparqlQuery(FUSEKI_URL, query);
      const stardogResponse = await sparqlQuery(STARDOG_URL, query);

      const normalize = (str: string) => {
        if (str.startsWith("{")) {
          let obj = JSON.parse(str) as {
            results: {
              bindings: Record<string, Record<string, Record<string, string>>>;
            };
          };
          obj = {
            ...obj,
            results: {
              ...obj.results,
              bindings: sortedKeys(
                mapValues(obj.results.bindings, (binding) =>
                  sortedKeys(mapValues(binding, (value) => sortedKeys(value)))
                )
              ),
            },
          };
          return JSON.stringify(obj, null, 2);
        } else if (str.startsWith("@prefix")) {
          // Read Turtle and output N-Triples
          const parser = new Parser();
          const writer = new Writer({ format: "N-Triples" });
          const quads = parser.parse(str);
          quads.forEach((quad) => {
            writer.addQuad(quad);
          });
          let res = "";
          writer.end((err, result: string) => {
            if (err) {
              throw err;
            }
            res = result
              .trim()
              .split("\n")
              .map((line) => {
                // Replace blank nodes with a consistent name
                // This is necessary because blank nodes are not guaranteed to have the same name across different runs
                return line.replace(/_:[^ ]*/, "BLANK");
              })
              .sort()
              .join("\n");
          });
          return res;
        }
        return str;
      };

      if (!fusekiResponse || !stardogResponse) {
        throw new Error("No response");
      }

      expect(normalize(fusekiResponse)).toBe(normalize(stardogResponse));
    });
  });
});
