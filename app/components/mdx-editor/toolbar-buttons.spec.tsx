import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ToolbarButtons } from "@/components/mdx-editor/toolbar-buttons";

afterEach(cleanup);

const renderToolbar = () => {
  render(
    <ToolbarButtons>
      <button>Bold</button>
      <button>Italic</button>
      <button>Underline</button>
    </ToolbarButtons>
  );

  return ["Bold", "Italic", "Underline"].map((name) =>
    screen.getByRole("button", { name })
  );
};

describe("ToolbarButtons", () => {
  it("keeps a single tab stop", () => {
    const buttons = renderToolbar();

    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });

  it("moves focus with arrow keys, Home and End", () => {
    const [bold, italic, underline] = renderToolbar();
    bold.focus();

    fireEvent.keyDown(bold, { key: "ArrowRight" });
    expect(document.activeElement).toBe(italic);
    expect(italic.tabIndex).toBe(0);
    expect(bold.tabIndex).toBe(-1);

    fireEvent.keyDown(italic, { key: "End" });
    expect(document.activeElement).toBe(underline);

    fireEvent.keyDown(underline, { key: "ArrowRight" });
    expect(document.activeElement).toBe(bold);

    fireEvent.keyDown(bold, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(underline);

    fireEvent.keyDown(underline, { key: "Home" });
    expect(document.activeElement).toBe(bold);
  });
});
