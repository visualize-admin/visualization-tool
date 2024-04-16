import { render } from "@testing-library/react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ChartConfig } from "@/config-types";

jest.mock("@mui/styles", () => ({
  makeStyles: () => () => ({}),
}));

jest.mock("@lingui/macro", () => ({
  defineMessage: (str: string) => str,
}));

jest.mock("@/graphql/hooks", () => ({
  useDataCubesComponentsQuery: jest.fn().mockReturnValue([
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
  useDataCubesMetadataQuery: jest.fn().mockReturnValue([
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
  useDataCubesObservationsQuery: jest.fn().mockReturnValue([
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

jest.mock("@/components/hint", () => ({
  Loading: jest.fn(() => null),
  NoDataHint: jest.fn(() => null),
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
});
