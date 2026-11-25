import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ChartConfig } from "@/config-types";
import { useDataCubesObservationsQuery } from "@/graphql/hooks";

vi.mock("@/locales/use-locale", () => ({
  useLocale: () => "en",
}));

vi.mock("@/graphql/hooks", () => ({
  useDataCubesComponentsQuery: vi.fn().mockReturnValue([
    {
      data: {
        dataCubesComponents: {
          dimensions: [],
          measures: [],
        },
      },
      error: undefined,
      fetching: false,
    },
  ]),
  useDataCubesMetadataQuery: vi.fn().mockReturnValue([
    {
      data: {
        dataCubesMetadata: [
          {
            iri: "abc",
            label: "ABC",
            dimensions: [],
            measures: [],
          },
        ],
      },
      error: undefined,
      fetching: false,
    },
  ]),
  useDataCubesObservationsQuery: vi.fn().mockReturnValue([
    {
      data: {
        dataCubesObservations: {
          data: [],
        },
      },
      error: undefined,
      fetching: false,
    },
  ]),
}));

vi.mock("@/components/hint", () => ({
  Loading: vi.fn(() => null),
  NoDataHint: vi.fn(() => null),
}));

describe("ChartDataWrapper", () => {
  it("should render the LoadingOverlay if prop is still being loaded", () => {
    const Chart = () => <div>My chart</div>;
    const LoadingOverlay = () => <div>Loading overlay</div>;
    const root = render(
      <LoadingStateProvider>
        <ChartDataWrapper
          chartConfig={{ cubes: [] } as any as ChartConfig}
          LoadingOverlayComponent={LoadingOverlay}
          Component={Chart}
          dataSource={{ type: "sparql", url: "url" }}
          observationQueryFilters={[]}
          fetching
        />
      </LoadingStateProvider>
    );
    expect(
      root.getByText("My chart").innerHTML.includes("My chart")
    ).toBeTruthy();
    expect(
      root.getByText("Loading overlay").innerHTML.includes("Loading overlay")
    ).toBeTruthy();
  });

  describe("the visually hidden data table for screen readers", () => {
    const Chart = () => <div>My chart</div>;

    const renderWithObservations = (chartType: ChartConfig["chartType"]) => {
      vi.mocked(useDataCubesObservationsQuery).mockReturnValue([
        {
          data: { dataCubesObservations: { data: [{ x: "a" }] } },
          error: undefined,
          fetching: false,
        },
      ] as unknown as ReturnType<typeof useDataCubesObservationsQuery>);

      return render(
        <LoadingStateProvider>
          <ChartDataWrapper
            chartConfig={{ cubes: [], chartType } as unknown as ChartConfig}
            LoadingOverlayComponent={() => null}
            Component={Chart}
            dataSource={{ type: "sparql", url: "url" }}
            observationQueryFilters={[]}
          />
        </LoadingStateProvider>
      );
    };

    afterEach(cleanup);

    it("is rendered for charts drawn as graphics", () => {
      const { container } = renderWithObservations("column");

      expect(container.querySelector("table")).not.toBeNull();
    });

    it("is not rendered for table charts, which are accessible themselves", () => {
      const { container } = renderWithObservations("table");

      expect(container.querySelector("table")).toBeNull();
    });
  });
});
