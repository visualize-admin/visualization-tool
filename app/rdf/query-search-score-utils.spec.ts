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

  it("should escape HTML in the text and regex-meta in the query", () => {
    expect(highlight("<img src=x onerror=alert(1)>", "img")).toEqual(
      "&lt;<b>img</b> src=x onerror=alert(1)&gt;"
    );
    expect(highlight("a.b", "a.b")).toEqual("<b>a.b</b>");
    expect(highlight("hello", "")).toEqual("hello");
  });
});
