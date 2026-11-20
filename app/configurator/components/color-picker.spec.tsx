import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomColorPicker } from "@/configurator/components/color-picker";
import { theme } from "@/themes/theme";
import { hexToHsva } from "@/utils/color-utils";

vi.mock("@lingui/macro", () => ({
  t: ({ message }: { message: string }) => message,
}));

afterEach(cleanup);

const renderPicker = () => {
  render(
    <ThemeProvider theme={theme}>
      <CustomColorPicker
        onChange={() => {}}
        defaultSelection={{ ...hexToHsva("#336699"), id: "selected" }}
        colorSwatches={[
          { color: "#ff0000", id: "red" },
          { color: "#00ff00", id: "green" },
        ]}
      />
    </ThemeProvider>
  );
};

const getHex = () => {
  return screen.getByRole<HTMLInputElement>("textbox", { name: "Hex color" })
    .value;
};

describe("CustomColorPicker", () => {
  it("changes saturation and brightness with arrow keys", async () => {
    renderPicker();
    const slider = await screen.findByRole("slider", {
      name: "Saturation and brightness",
    });
    const hex = getHex();

    fireEvent.keyDown(slider, { key: "ArrowRight", shiftKey: true });
    expect(getHex()).not.toBe(hex);

    const saturated = getHex();
    fireEvent.keyDown(slider, { key: "ArrowDown", shiftKey: true });
    expect(getHex()).not.toBe(saturated);
  });

  it("changes the hue with arrow keys", async () => {
    renderPicker();
    const slider = await screen.findByRole("slider", { name: "Hue" });
    const hex = getHex();

    fireEvent.keyDown(slider, { key: "ArrowRight", shiftKey: true });

    expect(getHex()).not.toBe(hex);
    expect(slider.getAttribute("aria-valuenow")).not.toBe("0");
  });

  it("selects a swatch with a named toggle button", () => {
    renderPicker();
    const swatch = screen.getByRole("button", { name: "#00ff00" });

    expect(swatch.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(swatch);

    expect(getHex()).toBe("#00ff00");
    expect(swatch.getAttribute("aria-pressed")).toBe("true");
  });
});
