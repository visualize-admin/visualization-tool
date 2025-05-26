import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useObservationLabels } from "@/charts/shared/observation-labels";
import { Observation } from "@/domain/data";

const data: Observation[] = [
  {
    "http://example.com": "foo",
    "http://example.com/__iri__": "http://example.com/foo",
  },
  {
    "http://example.com": "bar",
  },
];

const getObservationLabel = (d: Observation) => {
  return d["http://example.com"] as string;
};

describe("useObservationLabels", () => {
  const { result } = renderHook(() =>
    useObservationLabels(data, getObservationLabel, "http://example.com")
  );
  const { getValue, getLabel } = result.current;

  it("should correctly retrieve value when iri is present", () => {
    expect(getValue(data[0])).toEqual("http://example.com/foo");
  });

  it("should correctly retrieve label when iri is not present", () => {
    expect(getValue(data[1])).toEqual("bar");
  });

  it("should correctly retrieve labels", () => {
    expect(getLabel("http://example.com/foo")).toEqual("foo");
    expect(getLabel("bar")).toEqual("bar");
  });
});
