import { cleanup, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input, Radio, RadioGroup, Select } from "@/components/form";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
}));

vi.mock("@/locales/use-locale", () => ({
  useLocale: () => "en",
}));

afterEach(cleanup);

describe("RadioGroup", () => {
  it("exposes a labelled radio group", () => {
    render(
      <RadioGroup label="Scale type">
        <Radio label="Linear" name="scale" value="linear" checked />
        <Radio label="Log" name="scale" value="log" />
      </RadioGroup>
    );

    const group = screen.getByRole("radiogroup", { name: "Scale type" });
    expect(group.querySelectorAll("input[type=radio]")).toHaveLength(2);
  });
});

describe("Input", () => {
  it("links the error message to the invalid input", () => {
    render(
      <Input name="title" label="Title" error errorMessage="Name taken" />
    );
    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("title-error");
    expect(document.getElementById("title-error")?.textContent).toBe(
      "Name taken"
    );
  });

  it("keeps an empty live region while there is no error", () => {
    render(<Input name="title" label="Title" />);
    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(
      document.getElementById("title-error")?.getAttribute("aria-live")
    ).toBe("polite");
  });
});

describe("Select", () => {
  it("names the combobox by its label", () => {
    render(
      <Select
        id="sort"
        label="Sort by"
        value="name"
        options={[
          { value: "name", label: "Name" },
          { value: "date", label: "Date" },
        ]}
      />
    );

    expect(screen.getByRole("combobox", { name: /^Sort by/ })).toBeTruthy();
  });
});
