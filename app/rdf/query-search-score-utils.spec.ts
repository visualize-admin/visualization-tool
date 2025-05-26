import { describe, expect, it } from "vitest";

import { highlight } from "./query-search-score-utils";

describe("highlighting search words in query", () => {
  it("should work", () => {
    const tests = [
      ["Pollution is bad", "bad", "Pollution is <b>bad</b>"],
      [
        "The assessment of bathing waters is made on the basis of hygienic quality using E.coli and intestina",
        "Bathing",
        "The assessment of <b>bathing</b> waters is made on the basis of hygienic quality using E.coli and intestina",
      ],
      [
        "GEB - Einmalvergütung für Photovoltaikanlagen",
        "Einmalvergütung",
        "GEB - <b>Einmalvergütung</b> für Photovoltaikanlagen",
      ],
    ] as [string, string, string][];
    for (const t of tests) {
      const result = highlight(t[0], t[1]);
      expect(result).toEqual(t[2]);
    }
  });
});
