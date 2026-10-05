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

  it("should escape HTML contained in the text", () => {
    expect(highlight('<img src=x onerror="alert(1)"> bad', "bad")).toEqual(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; <b>bad</b>"
    );
  });

  it("should escape HTML contained in the matched part", () => {
    expect(highlight("<script>alert(1)</script>", "<script>")).toEqual(
      "<b>&lt;script&gt;</b>alert(1)&lt;/script&gt;"
    );
  });

  it("should treat regex special characters in the query literally", () => {
    expect(highlight("Report about C++ usage", "C++")).toEqual(
      "Report about <b>C++</b> usage"
    );
    expect(highlight("Pollution is bad", "(")).toEqual("Pollution is bad");
  });

  it("should escape HTML when there is nothing to highlight", () => {
    expect(highlight('<img src=x onerror="alert(1)">', "")).toEqual(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
    );
  });

  it("should not highlight empty matches for queries with extra spaces", () => {
    expect(highlight("Pollution is bad", "is  bad")).toEqual(
      "Pollution <b>is</b> <b>bad</b>"
    );
  });
});
