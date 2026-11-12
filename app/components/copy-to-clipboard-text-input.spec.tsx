import { ThemeProvider } from "@mui/material";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyToClipboardTextInput } from "@/components/copy-to-clipboard-text-input";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  t: ({ message }: { message: string }) => message,
}));

vi.mock("clipboard-polyfill/text", () => ({
  writeText: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderInput = () => {
  render(
    <ThemeProvider theme={theme}>
      <CopyToClipboardTextInput label="Chart URL" content="https://x" />
    </ThemeProvider>
  );
};

describe("CopyToClipboardTextInput", () => {
  it("names the input and the copy button", () => {
    renderInput();

    expect(screen.getByRole("textbox", { name: "Chart URL" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy: Chart URL" })
    ).toBeTruthy();
  });

  it("announces when the content was copied by keyboard", () => {
    renderInput();
    const button = screen.getByRole("button", { name: "Copy: Chart URL" });

    act(() => {
      button.focus();
    });
    fireEvent.click(button);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status").textContent).toBe("copied!");
  });
});
