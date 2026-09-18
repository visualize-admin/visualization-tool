import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CustomLayerDescription } from "@/charts/map/map-custom-layers-legend";

afterEach(cleanup);

describe("CustomLayerDescription", () => {
  it("renders WMS layer descriptions as text", () => {
    const description = '<img src="x" onerror="alert(document.domain)">';

    const { container } = render(
      <CustomLayerDescription description={description} />
    );

    expect(screen.getByText(description)).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });
});
