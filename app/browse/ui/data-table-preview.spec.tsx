import { ThemeProvider } from "@mui/material";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTablePreview } from "@/browse/ui/data-table-preview";
import { NominalDimension, Observation } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { expectNoAxeViolations } from "@/test/axe";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
}));

vi.mock("@/locales/use-locale", () => ({
  useLocale: () => "en",
}));

const CUBE_IRI = "https://example.org/cube";

const canton: NominalDimension = {
  __typename: "NominalDimension",
  cubeIri: CUBE_IRI,
  id: stringifyComponentId({
    unversionedCubeIri: CUBE_IRI,
    unversionedComponentIri: `${CUBE_IRI}/canton`,
  }),
  label: "Canton",
  isNumerical: false,
  isKeyDimension: true,
  values: [
    { value: "zh", label: "Zurich", position: 0 },
    { value: "be", label: "Bern", position: 1 },
    { value: "ag", label: "Aargau", position: 2 },
  ],
  relatedLimitValues: [],
};

const observations: Observation[] = [
  { [canton.id]: "Bern" },
  { [canton.id]: "Aargau" },
  { [canton.id]: "Zurich" },
];

describe("DataTablePreview", () => {
  afterEach(cleanup);

  it("is named by its caption and has a sort button beside the column label", async () => {
    const { container } = renderPreview();

    const table = screen.getByRole("table", { name: "Cantons" });
    const header = within(table).getByRole("columnheader");
    const sortButton = within(header).getByRole("button", {
      name: "Sort by Canton",
    });

    expect(sortButton.tagName).toBe("BUTTON");
    expect(header.getAttribute("aria-label")).toBe("Canton");
    expect(header.getAttribute("aria-sort")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("sorts with the sort button and reports the direction with aria-sort", () => {
    renderPreview();
    const header = screen.getByRole("columnheader");
    const sortButton = screen.getByRole("button", { name: "Sort by Canton" });

    fireEvent.click(sortButton);
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    expect(getCellTexts()).toEqual(["Zurich", "Bern", "Aargau"]);

    fireEvent.click(sortButton);
    expect(header.getAttribute("aria-sort")).toBe("descending");
    expect(getCellTexts()).toEqual(["Aargau", "Bern", "Zurich"]);
  });

  it("still sorts when the header cell itself is clicked", () => {
    renderPreview();
    const header = screen.getByRole("columnheader");

    fireEvent.click(header);

    expect(header.getAttribute("aria-sort")).toBe("ascending");
  });
});

const renderPreview = () => {
  return render(
    <ThemeProvider theme={theme}>
      <DataTablePreview
        title="Cantons"
        dimensions={[canton]}
        measures={[]}
        observations={observations}
        linkToMetadataPanel={false}
      />
    </ThemeProvider>
  );
};

const getCellTexts = () => {
  return screen.getAllByRole("cell").map((cell) => cell.textContent);
};
