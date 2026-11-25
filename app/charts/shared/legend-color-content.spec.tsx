import { ThemeProvider } from "@mui/material";
import { cleanup, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LegendColorContent } from "@/charts/shared/legend-color";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
}));

vi.mock("@/stores/interactive-filters", () => ({
  useChartInteractiveFilters: (
    selector: (state: Record<string, unknown>) => unknown
  ) =>
    selector({ categories: {}, addCategory: vi.fn(), removeCategory: vi.fn() }),
}));

vi.mock("@/formatters", () => ({
  useFormatNumber: () => (value: number) => `${value}`,
}));

describe("LegendColorContent", () => {
  afterEach(cleanup);

  it("keeps the focused filter checkbox when the values are reordered", () => {
    const { rerender } = render(<Legend values={["a", "b", "c"]} />);
    const checkbox = screen.getByRole("checkbox", { name: "b" });
    checkbox.focus();

    rerender(<Legend values={["b", "a", "c"]} />);

    expect(screen.getByRole("checkbox", { name: "b" })).toBe(checkbox);
    expect(document.activeElement).toBe(checkbox);
  });
});

const Legend = ({ values }: { values: string[] }) => {
  return (
    <ThemeProvider theme={theme}>
      <LegendColorContent
        groups={[[[], values]]}
        getColor={() => "#000000"}
        getLabel={(value) => value}
        symbol="square"
        interactive
        numberOfOptions={values.length}
      />
    </ThemeProvider>
  );
};
