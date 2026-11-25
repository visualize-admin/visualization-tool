import { describe, expect, it } from "vitest";

import {
  abbreviateObservations,
  usesAbbreviations,
} from "@/charts/table/abbreviate-observations";
import { TableFields } from "@/configurator";
import { Component, Observation } from "@/domain/data";

const OBSERVATIONS: Observation[] = [
  { canton: "Zurich", "canton/__iri__": "canton/1", region: "North" },
  { canton: "Bern", "canton/__iri__": "canton/2", region: "South" },
  { canton: "Unlisted", "canton/__iri__": "canton/9", region: "South" },
];

const COMPONENTS = [
  {
    __typename: "NominalDimension",
    id: "canton",
    values: [
      { value: "canton/1", label: "Zurich", alternateName: "ZH" },
      { value: "canton/2", label: "Bern", alternateName: "BE" },
    ],
  },
  {
    __typename: "NominalDimension",
    id: "region",
    values: [
      { value: "region/1", label: "North", alternateName: "N" },
      { value: "region/2", label: "South", alternateName: "S" },
    ],
  },
] as Component[];

describe("abbreviateObservations", () => {
  it("shows the abbreviation in columns that use abbreviations", () => {
    expect(
      abbreviateObservations({
        observations: OBSERVATIONS,
        fields: makeFields({ canton: true }),
        components: COMPONENTS,
      })
    ).toEqual([
      { canton: "ZH", "canton/__iri__": "canton/1", region: "North" },
      { canton: "BE", "canton/__iri__": "canton/2", region: "South" },
      { canton: "Unlisted", "canton/__iri__": "canton/9", region: "South" },
    ]);
  });

  it("keeps the label when a value has no abbreviation", () => {
    const [, , unlisted] = abbreviateObservations({
      observations: OBSERVATIONS,
      fields: makeFields({ canton: true, region: true }),
      components: COMPONENTS,
    });

    expect(unlisted).toEqual({
      canton: "Unlisted",
      "canton/__iri__": "canton/9",
      region: "S",
    });
  });

  it("finds values by label when the observation has no IRI", () => {
    const [north] = abbreviateObservations({
      observations: OBSERVATIONS,
      fields: makeFields({ region: true }),
      components: COMPONENTS,
    });

    expect(north.region).toBe("N");
  });

  it("finds values by IRI before label", () => {
    const [renamed] = abbreviateObservations({
      observations: [{ canton: "Bern", "canton/__iri__": "canton/1" }],
      fields: makeFields({ canton: true }),
      components: COMPONENTS,
    });

    expect(renamed.canton).toBe("ZH");
  });

  it("ignores the option on components that can't use abbreviations", () => {
    const [zurich] = abbreviateObservations({
      observations: OBSERVATIONS,
      fields: makeFields({ canton: true }),
      components: COMPONENTS.map((component) => ({
        ...component,
        __typename: "TemporalDimension",
      })) as Component[],
    });

    expect(zurich.canton).toBe("Zurich");
  });

  it("returns the observations untouched when no column uses abbreviations", () => {
    expect(
      abbreviateObservations({
        observations: OBSERVATIONS,
        fields: makeFields({}),
        components: COMPONENTS,
      })
    ).toBe(OBSERVATIONS);
  });
});

describe("usesAbbreviations", () => {
  it("needs the option and a component that can use abbreviations", () => {
    const [canton] = COMPONENTS;
    const column = makeFields({ canton: true }).canton;

    expect(usesAbbreviations({ column, component: canton })).toBe(true);
    expect(
      usesAbbreviations({
        column,
        component: { ...canton, __typename: "TemporalDimension" } as Component,
      })
    ).toBe(false);
    expect(
      usesAbbreviations({
        column: makeFields({}).canton,
        component: canton,
      })
    ).toBe(false);
  });
});

const makeFields = (useAbbreviations: Record<string, boolean>) =>
  Object.fromEntries(
    COMPONENTS.map((component) => [
      component.id,
      { useAbbreviations: useAbbreviations[component.id] },
    ])
  ) as TableFields;
