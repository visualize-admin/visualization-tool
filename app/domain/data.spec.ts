import { describe, expect, it } from "vitest";

import {
  canUseAbbreviations,
  Component,
  getDimensionValueLabel,
  getObservationIri,
} from "@/domain/data";

describe("getObservationIri", () => {
  it("reads the iri stored next to the component value", () => {
    expect(
      getObservationIri(
        { canton: "Zurich", "canton/__iri__": "https://example.org/canton/1" },
        "canton"
      )
    ).toBe("https://example.org/canton/1");
  });

  it("returns undefined without an iri or an observation", () => {
    expect(getObservationIri({ canton: "Zurich" }, "canton")).toBeUndefined();
    expect(
      getObservationIri({ canton: null, "canton/__iri__": null }, "canton")
    ).toBeUndefined();
    expect(getObservationIri(undefined, "canton")).toBeUndefined();
  });
});

describe("getDimensionValueLabel", () => {
  it("uses the abbreviation only when asked and available", () => {
    const zurich = { value: "1", label: "Zurich", alternateName: "ZH" };
    const bern = { value: "2", label: "Bern" };

    expect(
      getDimensionValueLabel({ dimensionValue: zurich, useAbbreviations: true })
    ).toBe("ZH");
    expect(
      getDimensionValueLabel({
        dimensionValue: zurich,
        useAbbreviations: false,
      })
    ).toBe("Zurich");
    expect(
      getDimensionValueLabel({ dimensionValue: bern, useAbbreviations: true })
    ).toBe("Bern");
    expect(
      getDimensionValueLabel({
        dimensionValue: { value: "3", label: "Basel", alternateName: "" },
        useAbbreviations: true,
      })
    ).toBe("Basel");
  });
});

describe("canUseAbbreviations", () => {
  it("allows supported component types whose values have abbreviations", () => {
    expect(canUseAbbreviations(makeComponent("NominalDimension", "ZH"))).toBe(
      true
    );
    expect(canUseAbbreviations(makeComponent("OrdinalMeasure", "ZH"))).toBe(
      true
    );
  });

  it("rejects other component types and values without abbreviations", () => {
    expect(canUseAbbreviations(makeComponent("TemporalDimension", "ZH"))).toBe(
      false
    );
    expect(canUseAbbreviations(makeComponent("NominalDimension"))).toBe(false);
    expect(canUseAbbreviations(undefined)).toBe(false);
  });
});

const makeComponent = (
  __typename: Component["__typename"],
  alternateName?: string
) => {
  return {
    __typename,
    id: "canton",
    values: [{ value: "1", label: "Zurich", alternateName }],
  } as Component;
};
