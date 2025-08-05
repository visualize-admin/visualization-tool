import { cleanup, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockedFunction,
  vi,
} from "vitest";

import { ChartMoreButton } from "@/components/chart-shared";
import { useChartTablePreview } from "@/components/chart-table-preview";
import { ChartConfig, ConfiguratorStatePublished } from "@/configurator";
import { useConfiguratorState } from "@/configurator/configurator-state/context";
import { useLocale } from "@/locales/use-locale";

vi.mock("@/configurator/configurator-state/context", () => ({
  useConfiguratorState: vi.fn(),
}));

vi.mock("@/locales/use-locale", () => ({
  useLocale: vi.fn(),
}));

vi.mock("@/components/chart-table-preview", () => ({
  useChartTablePreview: vi.fn(),
}));

vi.mock("@/utils/use-event-callback", () => ({
  useEventCallback: vi.fn((fn) => fn),
}));

vi.mock("@/utils/time-unit-to-formatter", () => ({
  timeUnitToFormatter: {
    Day: vi.fn(() => "2024-01-01"),
  },
}));

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  defineMessage: ({ message }: { message: string }) => message,
}));

describe("ChartMoreButton", () => {
  const mockUseConfiguratorState = useConfiguratorState as MockedFunction<
    typeof useConfiguratorState
  >;
  const mockUseLocale = useLocale as MockedFunction<typeof useLocale>;
  const mockUseChartTablePreview = useChartTablePreview as MockedFunction<
    typeof useChartTablePreview
  >;

  const createMockChartConfig = (
    overrides: Partial<ChartConfig> = {}
  ): ChartConfig =>
    ({
      key: "chart1",
      version: "1.0.0",
      chartType: "table",
      meta: {
        title: { de: "Test", fr: "Test", it: "Test", en: "Test Chart" },
        description: { de: "", fr: "", it: "", en: "" },
        label: { de: "", fr: "", it: "", en: "" },
      },
      cubes: [],
      limits: {},
      conversionUnitsByComponentId: {},
      activeField: undefined,
      fields: {},
      ...overrides,
    }) as ChartConfig;

  const createMockState = (
    overrides: Partial<ConfiguratorStatePublished> = {}
  ): ConfiguratorStatePublished => ({
    state: "PUBLISHED",
    version: "1.0.0",
    dataSource: {
      type: "sparql",
      url: "https://example.com/query",
    },
    layout: {
      type: "dashboard",
      layout: "canvas",
      layouts: {},
      blocks: [],
      meta: {
        title: { de: "", fr: "", it: "", en: "" },
        description: { de: "", fr: "", it: "", en: "" },
        label: { de: "", fr: "", it: "", en: "" },
      },
      activeField: undefined,
    },
    chartConfigs: [createMockChartConfig()],
    activeChartKey: "chart1",
    dashboardFilters: undefined,
    ...overrides,
  });

  const defaultProps = {
    chartKey: "chart1",
    components: [],
    disableDatabaseRelatedActions: false,
  };

  beforeEach(() => {
    mockUseLocale.mockReturnValue("en");
    mockUseChartTablePreview.mockReturnValue({
      setIsTableRaw: vi.fn(),
      setIsTable: vi.fn(),
      containerRef: { current: null },
      containerHeight: 0,
      isTable: false,
      computeContainerHeight: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should not render button when previewing a table chart in dashboard layout", () => {
    const mockState = createMockState({
      layout: {
        type: "dashboard",
        layout: "canvas",
        layouts: {},
        blocks: [],
        meta: {
          title: { de: "", fr: "", it: "", en: "" },
          description: { de: "", fr: "", it: "", en: "" },
          label: { de: "", fr: "", it: "", en: "" },
        },
        activeField: undefined,
      },
      chartConfigs: [createMockChartConfig({ chartType: "table" })],
    });

    mockUseConfiguratorState.mockReturnValue([mockState, vi.fn()]);

    const { container } = render(<ChartMoreButton {...defaultProps} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("chart-more-button")).toBeNull();
  });

  it("should render button when previewing a non-table chart in dashboard layout", () => {
    const mockState = createMockState({
      layout: {
        type: "dashboard",
        layout: "canvas",
        layouts: {},
        blocks: [],
        meta: {
          title: { de: "", fr: "", it: "", en: "" },
          description: { de: "", fr: "", it: "", en: "" },
          label: { de: "", fr: "", it: "", en: "" },
        },
        activeField: undefined,
      },
      chartConfigs: [createMockChartConfig({ chartType: "bar" })],
    });

    mockUseConfiguratorState.mockReturnValue([mockState, vi.fn()]);

    render(<ChartMoreButton {...defaultProps} />);

    expect(screen.queryByTestId("chart-more-button")).toBeTruthy();
  });

  it("should render button when previewing a table chart in non-dashboard layout with database actions", () => {
    const mockState = createMockState({
      layout: {
        type: "tab",
        blocks: [],
        meta: {
          title: { de: "", fr: "", it: "", en: "" },
          description: { de: "", fr: "", it: "", en: "" },
          label: { de: "", fr: "", it: "", en: "" },
        },
        activeField: undefined,
      },
      chartConfigs: [createMockChartConfig({ chartType: "table" })],
    });

    mockUseConfiguratorState.mockReturnValue([mockState, vi.fn()]);

    render(<ChartMoreButton {...defaultProps} configKey="test-key" />);

    expect(screen.queryByTestId("chart-more-button")).toBeTruthy();
  });

  it("should render button when not in published state", () => {
    const mockState = createMockState({
      state: "CONFIGURING" as any,
      layout: {
        type: "dashboard",
        layout: "canvas",
        layouts: {},
        blocks: [],
        meta: {
          title: { de: "", fr: "", it: "", en: "" },
          description: { de: "", fr: "", it: "", en: "" },
          label: { de: "", fr: "", it: "", en: "" },
        },
        activeField: undefined,
      },
      chartConfigs: [createMockChartConfig({ chartType: "table" })],
    });

    mockUseConfiguratorState.mockReturnValue([mockState, vi.fn()]);

    render(<ChartMoreButton {...defaultProps} />);

    expect(screen.queryByTestId("chart-more-button")).toBeTruthy();
  });
});
