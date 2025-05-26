import { describe, expect, it } from "vitest";

import { DataSource } from "@/config-types";

import { getSparqlEditorUrl } from "./sparql-utils";

describe("getSparqlEditorUrl", () => {
  const testData: { dataSource: DataSource; urlPrefix: string }[] = [
    "",
    "int.",
    "test.",
  ].map((d) => ({
    dataSource: {
      type: "sparql",
      url: `https://${d}lindas.admin.ch/query`,
    },
    urlPrefix: d,
  }));

  it("should correctly create url based on data source", () => {
    testData.forEach(({ dataSource, urlPrefix }) => {
      const stringUrl = getSparqlEditorUrl({
        query: "SELECT * FROM TABLE",
        dataSource,
      });
      const url = new URL(stringUrl);
      expect(url.origin + url.pathname).toEqual(
        `https://${urlPrefix}lindas.admin.ch/sparql`
      );
    });
  });
});
