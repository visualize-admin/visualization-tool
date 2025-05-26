import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BASE_VIEW_STATE,
  shouldRenderMap,
  useViewState,
  type ViewStateInitializationProps,
} from "@/charts/map/helpers";
import { type BBox } from "@/config-types";

const WIDTH = 400;
const HEIGHT = 200;
const LOCKED_BBOX: BBox = [
  [6.8965001, 46.3947983],
  [6.8965001, 46.3947983],
];
const FEATURES_BBOX: BBox = [
  [6.4965001, 46.2947983],
  [6.9965001, 46.4947983],
];

describe("useViewState", () => {
  it("should properly set defaultViewState", () => {
    const { result, rerender } = renderHook<
      ReturnType<typeof useViewState>,
      ViewStateInitializationProps
    >(useViewState, {
      initialProps: {
        width: WIDTH,
        height: HEIGHT,
        lockedBBox: undefined,
        featuresBBox: undefined,
      },
    });

    expect(BASE_VIEW_STATE).toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );

    rerender({
      width: WIDTH,
      height: HEIGHT,
      lockedBBox: undefined,
      featuresBBox: FEATURES_BBOX,
    });

    expect(BASE_VIEW_STATE).not.toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );
  });

  it("should properly set viewState", () => {
    const { result } = renderHook<
      ReturnType<typeof useViewState>,
      ViewStateInitializationProps
    >(useViewState, {
      initialProps: {
        width: WIDTH,
        height: HEIGHT,
        lockedBBox: undefined,
        featuresBBox: FEATURES_BBOX,
      },
    });

    expect(BASE_VIEW_STATE).not.toEqual(
      expect.objectContaining(result.current.defaultViewState)
    );

    const { result: resultLocked } = renderHook<
      ReturnType<typeof useViewState>,
      ViewStateInitializationProps
    >(useViewState, {
      initialProps: {
        width: WIDTH,
        height: HEIGHT,
        lockedBBox: LOCKED_BBOX,
        featuresBBox: FEATURES_BBOX,
      },
    });

    expect(resultLocked.current.viewState).not.toEqual(
      result.current.viewState
    );
  });
});

describe("shouldRenderMap", () => {
  it("should work", () => {
    expect(
      shouldRenderMap({
        areaDimensionId: undefined,
        symbolDimensionId: undefined,
        geometries: [],
        coordinates: [{ iri: "", label: "", latitude: 0, longitude: 0 }],
      })
    ).toBe(true);
    expect(
      shouldRenderMap({
        areaDimensionId: undefined,
        symbolDimensionId: undefined,
        geometries: undefined,
        coordinates: undefined,
      })
    ).toBe(false);
    expect(
      shouldRenderMap({
        areaDimensionId: "ABC",
        symbolDimensionId: undefined,
        geometries: undefined,
        coordinates: undefined,
      })
    ).toBe(false);
    expect(
      shouldRenderMap({
        areaDimensionId: undefined,
        symbolDimensionId: "ABC",
        geometries: undefined,
        coordinates: undefined,
      })
    ).toBe(false);
    expect(
      shouldRenderMap({
        areaDimensionId: undefined,
        symbolDimensionId: "ABC",
        geometries: undefined,
        coordinates: [{ iri: "", label: "", latitude: 0, longitude: 0 }],
      })
    ).toBe(true);
    expect(
      shouldRenderMap({
        areaDimensionId: undefined,
        symbolDimensionId: "ABC",
        geometries: [],
        coordinates: undefined,
      })
    ).toBe(true);
  });
});
