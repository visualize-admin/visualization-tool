import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  abbreviateObservations,
  getAbbreviatedComponents,
  useAbbreviatedComponents,
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
      abbreviate({
        observations: OBSERVATIONS,
        useAbbreviations: { canton: true },
        components: COMPONENTS,
      })
    ).toEqual([
      { canton: "ZH", "canton/__iri__": "canton/1", region: "North" },
      { canton: "BE", "canton/__iri__": "canton/2", region: "South" },
      { canton: "Unlisted", "canton/__iri__": "canton/9", region: "South" },
    ]);
  });

  it("keeps the label when a value has no abbreviation", () => {
    const [, , unlisted] = abbreviate({
      observations: OBSERVATIONS,
      useAbbreviations: { canton: true, region: true },
      components: COMPONENTS,
    });

    expect(unlisted).toEqual({
      canton: "Unlisted",
      "canton/__iri__": "canton/9",
      region: "S",
    });
  });

  it("finds values by label when the observation has no IRI", () => {
    const [north] = abbreviate({
      observations: OBSERVATIONS,
      useAbbreviations: { region: true },
      components: COMPONENTS,
    });

    expect(north.region).toBe("N");
  });

  it("finds values by IRI before label", () => {
    const [renamed] = abbreviate({
      observations: [{ canton: "Bern", "canton/__iri__": "canton/1" }],
      useAbbreviations: { canton: true },
      components: COMPONENTS,
    });

    expect(renamed.canton).toBe("ZH");
  });

  it("ignores the option on components that can't use abbreviations", () => {
    const [zurich] = abbreviate({
      observations: OBSERVATIONS,
      useAbbreviations: { canton: true },
      components: COMPONENTS.map((component) => ({
        ...component,
        __typename: "TemporalDimension",
      })) as Component[],
    });

    expect(zurich.canton).toBe("Zurich");
  });

  it("returns the observations untouched when no column uses abbreviations", () => {
    expect(
      abbreviate({
        observations: OBSERVATIONS,
        useAbbreviations: {},
        components: COMPONENTS,
      })
    ).toBe(OBSERVATIONS);
  });
});

describe("useAbbreviatedComponents", () => {
  it("keeps the same components while other column options change", () => {
    const { result, rerender } = renderHook(
      (props: { fields: TableFields }) =>
        useAbbreviatedComponents({
          fields: props.fields,
          components: COMPONENTS,
        }),
      { initialProps: { fields: makeFields({ canton: true }) } }
    );
    const first = result.current;
    rerender({ fields: makeFields({ canton: true }) });

    expect(result.current).toBe(first);
    expect(first.map((component) => component.id)).toEqual(["canton"]);

    rerender({ fields: makeFields({ canton: true, region: true }) });

    expect(result.current.map((component) => component.id)).toEqual([
      "canton",
      "region",
    ]);
  });
});

const abbreviate = ({
  observations,
  useAbbreviations,
  components,
}: {
  observations: Observation[];
  useAbbreviations: Record<string, boolean>;
  components: Component[];
}) => {
  return abbreviateObservations({
    observations,
    components: getAbbreviatedComponents({
      fields: makeFields(useAbbreviations),
      components,
    }),
  });
};

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
