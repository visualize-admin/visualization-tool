import { ThemeProvider } from "@mui/material";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SelectTree, Tree } from "@/components/select-tree";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { expectNoAxeViolations } from "@/test/axe";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
  plural: (count: number, forms: Record<string, string>) =>
    (count === 0 ? forms[0] : count === 1 ? forms.one : forms.other).replace(
      "#",
      `${count}`
    ),
}));

const OPTIONS: Tree = [
  {
    value: "switzerland",
    label: "Switzerland",
    hasValue: false,
    selectable: false,
    children: [
      { value: "bern", label: "Bern", hasValue: true },
      { value: "zurich", label: "Zurich", hasValue: true },
    ],
  },
];

const OPTIONS_WITH_NONE: Tree = [
  { value: FIELD_VALUE_NONE, label: "Select filter", hasValue: true },
  ...OPTIONS,
];

describe("SelectTree", () => {
  afterEach(cleanup);

  it("is a labelled button that opens a labelled dialog", async () => {
    const { baseElement } = renderSelectTree({ value: "bern" });
    const trigger = screen.getByRole("button", { name: "Canton Bern" });

    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    openWithKeyboard(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: "Canton" });
    expect(within(dialog).getByRole("textbox", { name: "Search" })).toBe(
      document.activeElement
    );
    expect(
      within(dialog).getByRole("button", { name: "Clear search field" })
    ).toBeTruthy();
    expect(within(dialog).getByRole("tree", { name: "Canton" })).toBeTruthy();
    await expectNoAxeViolations(baseElement);
  });

  it("does not open while read only", () => {
    renderSelectTree({ value: "bern", readOnly: true });
    const trigger = screen.getByRole("button", { name: "Canton Bern" });

    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    openWithKeyboard(trigger);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("searches with special characters and announces the result count", () => {
    vi.useFakeTimers();
    renderSelectTree({ value: "bern" });
    openWithKeyboard(screen.getByRole("button", { name: "Canton Bern" }));
    const search = screen.getByRole("textbox", { name: "Search" });

    fireEvent.change(search, { target: { value: "(" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("status").textContent).toBe("No results");

    fireEvent.change(search, { target: { value: "zur" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("status").textContent).toBe("1 result");
    vi.useRealTimers();
  });

  it("selects by keyboard but ignores non-selectable nodes", () => {
    const onChange = vi.fn();
    renderSelectTree({ value: "", onChange });
    openWithKeyboard(screen.getByRole("button", { name: /Canton/ }));
    const tree = screen.getByRole("tree");

    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: " " });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(tree, { key: "ArrowDown" });
    fireEvent.keyDown(tree, { key: "ArrowDown" });
    fireEvent.keyDown(tree, { key: " " });
    expect(onChange).toHaveBeenCalledWith({ target: { value: "zurich" } });
  });

  it("adds a value by keyboard in multi mode and stays open", () => {
    const onChange = vi.fn();
    renderSelectTree({ value: [], onChange, isMulti: true });
    openWithKeyboard(screen.getByRole("button", { name: /Canton/ }));
    const tree = screen.getByRole("tree");

    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: " " });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(tree, { key: "ArrowDown" });
    fireEvent.keyDown(tree, { key: " " });

    expect(onChange).toHaveBeenCalledWith({ target: { value: ["bern"] } });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("removes a value by keyboard in multi mode", () => {
    const onChange = vi.fn();
    renderSelectTree({ value: ["zurich"], onChange, isMulti: true });
    openWithKeyboard(screen.getByRole("button", { name: /Canton/ }));
    const tree = screen.getByRole("tree");

    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: " " });

    expect(onChange).toHaveBeenCalledWith({ target: { value: [] } });
  });

  it("keeps the selection when a range selection includes the none option", () => {
    const onChange = vi.fn();
    renderSelectTree({
      value: ["zurich"],
      onChange,
      isMulti: true,
      options: OPTIONS_WITH_NONE,
    });
    openWithKeyboard(screen.getByRole("button", { name: /Canton/ }));
    const tree = screen.getByRole("tree");

    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: "a", ctrlKey: true });
    expect(onChange).not.toHaveBeenCalledWith({ target: { value: [] } });

    fireEvent.keyDown(tree, { key: "Home" });
    fireEvent.keyDown(tree, { key: " " });
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: [] } });
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderSelectTree({ value: "bern" });
    const trigger = screen.getByRole("button", { name: "Canton Bern" });
    openWithKeyboard(trigger);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("gives each instance its own ids", () => {
    render(
      <ThemeProvider theme={theme}>
        <SelectTree
          label="Canton"
          options={OPTIONS}
          value="bern"
          onChange={vi.fn()}
        />
        <SelectTree
          label="Region"
          options={OPTIONS}
          value="zurich"
          onChange={vi.fn()}
        />
      </ThemeProvider>
    );

    const canton = screen.getByRole("button", { name: "Canton Bern" });
    const region = screen.getByRole("button", { name: "Region Zurich" });
    expect(canton.id).not.toBe(region.id);
  });
});

const renderSelectTree = ({
  value,
  onChange = vi.fn(),
  isMulti,
  readOnly,
  options = OPTIONS,
}: {
  options?: Tree;
  value: string | string[];
  onChange?: (e: { target: { value: string | string[] } }) => void;
  isMulti?: boolean;
  readOnly?: boolean;
}) => {
  return render(
    <ThemeProvider theme={theme}>
      <SelectTree
        label="Canton"
        options={options}
        value={value}
        onChange={onChange}
        isMulti={isMulti}
        readOnly={readOnly}
      />
    </ThemeProvider>
  );
};

const openWithKeyboard = (trigger: HTMLElement) => {
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
};
