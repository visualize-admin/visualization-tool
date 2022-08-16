import { Bounds } from "@/charts/shared/use-width";
import { BBox } from "@/configurator/config-types";

import { BASE_VIEW_STATE, initializeViewState } from "./helpers";

describe("initialization of view state", () => {
  const bbox = [
    [0, 0],
    [0, 0],
  ] as BBox;
  const chartDimensions = {
    width: 400,
    height: 400,
  } as Bounds;

  it("should use base view state when bbox is undefined", () => {
    const viewState = initializeViewState({
      chartDimensions,
      bbox: undefined,
      locked: true,
    });

    expect(viewState).toEqual(BASE_VIEW_STATE);
  });

  it("should use base view state when a map is not locked", () => {
    const viewState = initializeViewState({
      chartDimensions,
      bbox,
      locked: false,
    });

    expect(viewState).toEqual(BASE_VIEW_STATE);
  });

  it("should use not use base view state when map is locked", () => {
    const viewState = initializeViewState({
      chartDimensions,
      bbox,
      locked: true,
    });

    expect(viewState).not.toEqual(BASE_VIEW_STATE);
  });
});
