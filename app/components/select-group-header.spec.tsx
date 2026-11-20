import { MenuItem, Select } from "@mui/material";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SelectGroupHeader } from "@/components/select-group-header";

afterEach(cleanup);

describe("SelectGroupHeader", () => {
  it("is not exposed or focused as an option", () => {
    render(
      <Select open value="" displayEmpty MenuProps={{ transitionDuration: 0 }}>
        <SelectGroupHeader>Sequential</SelectGroupHeader>
        <MenuItem value="blues">Blues</MenuItem>
        <MenuItem value="greens">Greens</MenuItem>
      </Select>
    );

    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Blues",
      "Greens",
    ]);
    expect(screen.getByText("Sequential").getAttribute("role")).toBe(
      "presentation"
    );
    expect(document.activeElement).toBe(options[0]);
  });
});
