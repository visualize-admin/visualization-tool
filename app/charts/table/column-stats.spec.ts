import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  getBarWidthScale,
  getMaxAbsoluteValue,
  useColumnStats,
} from "@/charts/table/column-stats";
import { BAR_CELL_PADDING } from "@/charts/table/constants";
import { TableFields } from "@/configurator";
import { Observation } from "@/domain/data";

vi.mock("@/utils/get-text-width", () => ({
  getTextWidth: vi.fn((text: string) => text.length * 10),
}));

const OBSERVATIONS: Observation[] = [
  { votes: 10, change: -40 },
  { votes: 1234567890123, change: 25 },
  { votes: null, change: null },
];

const FORMATTERS = {
  votes: (value: number) => `${value}`,
  change: (value: number) => `${value}`,
};

describe("getBarWidthScale", () => {
  it("spans the values and fits the longest formatted value", () => {
    const scale = getBarWidthScale({
      observations: OBSERVATIONS,
      componentId: "votes",
      formatter: FORMATTERS.votes,
    });

    expect(scale.domain()).toEqual([10, 1234567890123]);
    expect(scale.range()).toEqual([
      0,
      "1234567890123".length * 10 + 80 - BAR_CELL_PADDING * 2,
    ]);
  });

  it("is at least 150px wide", () => {
    const scale = getBarWidthScale({
      observations: [{ votes: 1 }],
      componentId: "votes",
      formatter: FORMATTERS.votes,
    });

    expect(scale.range()[1]).toBe(150 - BAR_CELL_PADDING * 2);
  });
});

describe("getMaxAbsoluteValue", () => {
  it("returns the largest absolute value", () => {
    expect(
      getMaxAbsoluteValue({ observations: OBSERVATIONS, componentId: "change" })
    ).toBe(40);
  });
});

describe("useColumnStats", () => {
  it("keeps the stats while other column options change", () => {
    const { result, rerender } = renderHook(
      (props: { fields: TableFields }) =>
        useColumnStats({
          fields: props.fields,
          observations: OBSERVATIONS,
          formatters: FORMATTERS,
        }),
      { initialProps: { fields: makeFields({ textColor: "#000" }) } }
    );
    const first = result.current;
    rerender({ fields: makeFields({ textColor: "#fff" }) });

    expect(result.current.barWidthScales).toBe(first.barWidthScales);
    expect(result.current.heatmapMaxAbsoluteValues).toBe(
      first.heatmapMaxAbsoluteValues
    );
    expect(Object.keys(first.barWidthScales)).toEqual(["votes"]);
    expect(first.heatmapMaxAbsoluteValues).toEqual({ change: 40 });
  });
});

describe("useColumnStats recomputing", () => {
  it("recomputes when the data or the column styles change", () => {
    const { result, rerender } = renderHook(
      (props: { fields: TableFields; observations: Observation[] }) =>
        useColumnStats({
          fields: props.fields,
          observations: props.observations,
          formatters: FORMATTERS,
        }),
      {
        initialProps: {
          fields: makeFields({ textColor: "#000" }),
          observations: OBSERVATIONS,
        },
      }
    );
    rerender({
      fields: makeFields({ textColor: "#000" }),
      observations: [{ votes: 5, change: -90 }],
    });

    expect(result.current.barWidthScales.votes.domain()).toEqual([5, 5]);
    expect(result.current.heatmapMaxAbsoluteValues).toEqual({ change: 90 });

    rerender({
      fields: {
        ...makeFields({ textColor: "#000" }),
        change: {
          componentId: "change",
          columnStyle: { type: "bar", textColor: "#000" },
        },
      } as unknown as TableFields,
      observations: OBSERVATIONS,
    });

    expect(Object.keys(result.current.barWidthScales)).toEqual([
      "votes",
      "change",
    ]);
    expect(result.current.heatmapMaxAbsoluteValues).toEqual({});
  });
});

const makeFields = ({ textColor }: { textColor: string }) => {
  return {
    votes: {
      componentId: "votes",
      columnStyle: { type: "bar", textColor },
    },
    change: {
      componentId: "change",
      columnStyle: { type: "heatmap", textColor },
    },
  } as unknown as TableFields;
};
