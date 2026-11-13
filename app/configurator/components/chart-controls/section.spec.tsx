import { ThemeProvider } from "@mui/material";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ControlSection,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
}));

vi.mock("@/src", () => ({
  useConfiguratorState: () => [{}, vi.fn()],
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderSection = (onPanelKeyDown = vi.fn()) => {
  render(
    <ThemeProvider theme={theme}>
      <div onKeyDown={onPanelKeyDown}>
        <ControlSection collapse>
          <SectionTitle warnMessage="Please add a title.">
            Title & Description
          </SectionTitle>
        </ControlSection>
      </div>
    </ThemeProvider>
  );

  return screen.getByRole("button", { name: "Title & Description" });
};

describe("SectionTitle", () => {
  it("exposes its expanded state", () => {
    const header = renderSection();
    expect(header.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(header);

    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("describes the header with its warning", () => {
    const header = renderSection();
    const description = document.getElementById(
      header.getAttribute("aria-describedby") ?? ""
    );

    expect(description?.textContent).toBe("Please add a title.");
  });

  it("closes the warning tooltip with Escape without closing the panel", () => {
    const onPanelKeyDown = vi.fn();
    const header = renderSection(onPanelKeyDown);
    const icon = header.querySelector("svg")?.closest("p, span")!;

    fireEvent.mouseOver(icon);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip").textContent).toBe("Please add a title.");

    fireEvent.keyDown(header, { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onPanelKeyDown).not.toHaveBeenCalled();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
