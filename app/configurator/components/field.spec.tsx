import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimeInput } from "@/configurator/components/field";
import { getD3TimeFormatLocale } from "@/locales/locales";

describe("TimeInput", () => {
  const expectedValue = "2020-05-24";
  const setup = ({ isOptional, id }: { isOptional: boolean; id: string }) => {
    let currentValue = "";

    const root = render(
      <TimeInput
        id={id}
        label={id}
        value={currentValue}
        timeFormat="%Y-%m-%d"
        formatLocale={getD3TimeFormatLocale("en")}
        isOptional={isOptional}
        onChange={(e) => (currentValue = e.currentTarget.value)}
      />
    );

    return { node: root.getByLabelText(id), getValue: () => currentValue };
  };

  describe("key dimension", () => {
    const { node, getValue } = setup({
      isOptional: false,
      id: "mandatory-input",
    });

    it("should set the date if passed in correct format", async () => {
      fireEvent.change(node, {
        target: { value: expectedValue },
      });
      expect(getValue()).toEqual(expectedValue);

      fireEvent.change(node, {
        target: { value: "2020-13-38" },
      });
      expect(getValue()).toEqual(expectedValue);
    });

    it("should revert to previous value if passed an empty string for mandatory input", () => {
      fireEvent.change(node, {
        target: { value: expectedValue },
      });

      fireEvent.change(node, {
        target: { value: "" },
      });
      expect(getValue()).toEqual(expectedValue);
    });
  });

  describe("optional dimension", () => {
    const { node, getValue } = setup({
      isOptional: true,
      id: "optional-input",
    });
    it("shouldn't revert to previous correct value if passed an empty string for optional input", () => {
      fireEvent.change(node, {
        target: { value: expectedValue },
      });

      fireEvent.change(node, {
        target: { value: "" },
      });
      expect(getValue()).toEqual("");
    });
  });
});
