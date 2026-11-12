import { ThemeProvider } from "@mui/material";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MetadataPanel } from "@/components/metadata-panel";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel-store";
import { tableConfig } from "@/docs/fixtures";
import { DimensionValue, NominalDimension } from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/data-source";
import { mkJoinById } from "@/graphql/join";
import { ComponentId, stringifyComponentId } from "@/graphql/make-component-id";
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

vi.mock("@/configurator/configurator-state/context", async () => {
  const { states } = await import("@/docs/fixtures");

  return { useConfiguratorState: () => [states[1]] };
});

vi.mock("@/graphql/hooks", () => ({
  useDataCubesMetadataQuery: () => [
    { data: { dataCubesMetadata: [{ iri: CUBE_IRI, title: "Cube" }] } },
  ],
  useDataCubesComponentsQuery: () => [
    {
      data: { dataCubesComponents: { dimensions: components, measures: [] } },
      fetching: false,
    },
  ],
}));

const CUBE_IRI = "https://example.org/cube";

const makeDimension = ({
  label,
  values,
}: {
  label: string;
  values: DimensionValue[];
}): NominalDimension => ({
  __typename: "NominalDimension",
  cubeIri: CUBE_IRI,
  id: stringifyComponentId({
    unversionedCubeIri: CUBE_IRI,
    unversionedComponentIri: `${CUBE_IRI}/${label}`,
  }),
  label,
  isNumerical: false,
  isKeyDimension: true,
  values,
  relatedLimitValues: [],
});

const components = [
  makeDimension({
    label: "Canton",
    values: [
      { value: "zh", label: "Zurich", description: "Largest canton" },
      { value: "be", label: "Bern" },
    ],
  }),
  makeDimension({
    label: "Year",
    values: [{ value: "2024", label: "2024" }],
  }),
];

const [canton] = components;

const joinedCanton: NominalDimension = {
  ...canton,
  cubeIri: "joinBy",
  id: mkJoinById(0) as ComponentId,
  isJoinByDimension: true,
  originalIds: [
    {
      cubeIri: CUBE_IRI,
      dimensionId: canton.id,
      label: "Canton",
      description: "",
    },
  ],
};

afterEach(cleanup);

describe("MetadataPanel", () => {
  it("opens as a labelled dialog and returns focus to the toggle on Escape", async () => {
    renderPanel();
    const toggle = screen.getByRole("button", { name: "Details" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    const dialog = await openPanel(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe(dialog.id);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const close = within(dialog).getByRole("button", { name: "Close" });
    await waitFor(() => expect(document.activeElement).toBe(close));

    fireEvent.keyDown(close, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("names each Show more button after its dimension and moves focus between views", async () => {
    renderPanel();
    const dialog = await openPanel(
      screen.getByRole("button", { name: "Details" })
    );

    expect(
      within(dialog).getByRole("combobox", { name: "Jump to..." })
    ).toBeTruthy();
    expect(within(dialog).queryByRole("link")).toBeNull();
    expect(
      within(dialog).getByRole("button", { name: /^Show more ?: Year$/ })
    ).toBeTruthy();
    await expectNoAxeViolations(dialog);

    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Show more ?: Canton$/ })
    );

    const back = await within(dialog).findByRole("button", { name: "Back" });
    await waitFor(() => expect(document.activeElement).toBe(back));
    expect(
      within(dialog).getByRole("heading", { name: "Canton", level: 3 })
    ).toBeTruthy();

    fireEvent.click(back);

    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: /^Show more ?: Canton$/ })
      )
    );
  });

  it("returns focus to the listed Show more button of a joined dimension opened from outside", async () => {
    const store = renderPanel([joinedCanton]);
    act(() => store.getState().actions.openComponent(joinedCanton));
    const dialog = await screen.findByRole("dialog", { name: "Details" });

    fireEvent.click(
      await within(dialog).findByRole("button", { name: "Back" })
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: /^Show more ?: Canton$/ })
      )
    );
  });

  it("renders the available values as a labelled list", async () => {
    renderPanel();
    const dialog = await openPanel(
      screen.getByRole("button", { name: "Details" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Show more ?: Canton$/ })
    );

    const list = await within(dialog).findByRole("list", {
      name: "Available values",
    });
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(
      items.some(
        (item) =>
          within(item).queryByText(/Zurich/) &&
          within(item).queryByText("Largest canton")
      )
    ).toBe(true);
    await expectNoAxeViolations(dialog);
  });
});

const renderPanel = (panelComponents = components) => {
  const store = createMetadataPanelStore();
  store.getState().actions.setActiveSection("data");

  render(
    <ThemeProvider theme={theme}>
      <MetadataPanelStoreContext.Provider value={store}>
        <MetadataPanel
          chartConfig={tableConfig}
          dashboardFilters={undefined}
          dataSource={DEFAULT_DATA_SOURCE}
          components={panelComponents}
        />
      </MetadataPanelStoreContext.Provider>
    </ThemeProvider>
  );

  return store;
};

const openPanel = async (toggle: HTMLElement) => {
  toggle.focus();
  fireEvent.click(toggle);

  return screen.findByRole("dialog", { name: "Details" });
};
