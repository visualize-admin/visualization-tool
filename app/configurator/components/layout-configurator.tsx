import { t, Trans } from "@lingui/macro";
import {
  Box,
  Stack,
  Switch,
  SwitchProps,
  Typography,
  useEventCallback,
} from "@mui/material";
import capitalize from "lodash/capitalize";
import omit from "lodash/omit";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { DataFilterGenericDimensionProps } from "@/charts/shared/chart-data-filters";
import { useCombinedTemporalDimension } from "@/charts/shared/use-combined-temporal-dimension";
import { Select } from "@/components/form";
import {
  FREE_CANVAS_BREAKPOINTS,
  generateLayout,
} from "@/components/react-grid";
import {
  ChartConfig,
  DashboardTimeRangeFilter,
  getChartConfig,
  LayoutDashboard,
  ReactGridLayoutType,
} from "@/config-types";
import { LayoutAnnotator } from "@/configurator/components/annotators";
import { DataFilterSelectGeneric } from "@/configurator/components/chart-configurator";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  canRenderDatePickerField,
  DatePickerField,
  DatePickerFieldProps,
} from "@/configurator/components/field-date-picker";
import { IconButton } from "@/configurator/components/icon-button";
import {
  extractDataPickerOptionsFromDimension,
  timeUnitToFormatter,
} from "@/configurator/components/ui-helpers";
import {
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import {
  canDimensionBeTimeFiltered,
  Dimension,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";
import { useConfigsCubeComponents } from "@/graphql/hooks";
import { useLocale } from "@/src";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";
import { getTimeFilterOptions } from "@/utils/time-filter-options";

export const LayoutConfigurator = () => {
  return (
    <>
      <LayoutAnnotator />
      <LayoutLayoutConfigurator />
      <LayoutSharedFiltersConfigurator />
    </>
  );
};

const LayoutLayoutConfigurator = () => {
  const [state] = useConfiguratorState(isLayouting);
  const { layout } = state;
  switch (layout.type) {
    case "dashboard":
      return (
        <ControlSection
          role="tablist"
          aria-labelledby="controls-design"
          collapse
        >
          <SubsectionTitle
            titleId="controls-design"
            disabled={false}
            gutterBottom={false}
          >
            <Trans id="controls.section.layout-options">Layout Options</Trans>
          </SubsectionTitle>
          <ControlSectionContent px="small" gap="none">
            <Box
              sx={{
                display: "flex",
                gap: "0.75rem",
                m: 2,
              }}
            >
              <DashboardLayoutButton type="tall" layout={layout} />
              <DashboardLayoutButton type="vertical" layout={layout} />
              <DashboardLayoutButton type="canvas" layout={layout} />
            </Box>
          </ControlSectionContent>
        </ControlSection>
      );
    default:
      return null;
  }
};

const LayoutSharedFiltersConfigurator = () => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { potentialTimeRangeFilterIris, potentialDataFilterIris } =
    useDashboardInteractiveFilters();
  const { timeRange, dataFilters } = state.dashboardFilters ?? {};

  const locale = useLocale();
  const [{ data, fetching }] = useConfigsCubeComponents({
    variables: {
      state,
      locale,
    },
  });
  const dimensions = useMemo(
    () => data?.dataCubesComponents.dimensions ?? [],
    [data?.dataCubesComponents.dimensions]
  );

  const formatLocale = useTimeFormatLocale();
  const timeFormatUnit = useTimeFormatUnit();

  const combinedTemporalDimension = useCombinedTemporalDimension();

  const handleTimeRangeFilterToggle: SwitchProps["onChange"] = useEventCallback(
    (_, checked) => {
      if (checked) {
        const options = getTimeFilterOptions({
          dimension: combinedTemporalDimension,
          formatLocale,
          timeFormatUnit,
        });

        const from = options.sortedOptions[0]?.date;
        const to = options.sortedOptions.at(-1)?.date;
        const formatDate =
          timeUnitToFormatter[combinedTemporalDimension.timeUnit];

        if (!from || !to) {
          return;
        }

        dispatch({
          type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
          value: {
            active: true,
            timeUnit: combinedTemporalDimension.timeUnit,
            presets: {
              from: formatDate(from),
              to: formatDate(to),
            },
          },
        });
      } else {
        dispatch({
          type: "DASHBOARD_TIME_RANGE_FILTER_REMOVE",
        });
      }
    }
  );

  const handleDataFiltersToggle = useEventCallback(
    (checked: boolean, componentIri: string) => {
      if (checked) {
        dispatch({
          type: "DASHBOARD_DATA_FILTERS_SET",
          value: {
            componentIris: dataFilters?.componentIris
              ? [...dataFilters.componentIris, componentIri].sort((a, b) => {
                  const aIndex =
                    dimensions.find((d) => d.iri === a)?.order ??
                    dimensions.findIndex((d) => d.iri === a) ??
                    0;
                  const bIndex =
                    dimensions.find((d) => d.iri === b)?.order ??
                    dimensions.findIndex((d) => d.iri === b) ??
                    0;
                  return aIndex - bIndex;
                })
              : [componentIri],
            filters: dataFilters?.filters ?? {},
          },
        });
        const value = dimensions.find((d) => d.iri === componentIri)?.values[0]
          .value as string;
        dispatch({
          type: "FILTER_SET_SINGLE",
          value: {
            // FIXME: shared filters should be scoped per cube
            filters: [{ cubeIri: "", dimensionIri: componentIri }],
            value,
          },
        });
      } else {
        dispatch({
          type: "DASHBOARD_DATA_FILTER_REMOVE",
          value: {
            dimensionIri: componentIri,
          },
        });
        dispatch({
          type: "FILTER_REMOVE_SINGLE",
          value: {
            // FIXME: shared filters should be scoped per cube
            filters: [{ cubeIri: "", dimensionIri: componentIri }],
          },
        });
      }
    }
  );

  switch (layout.type) {
    case "tab":
    case "dashboard":
      if (
        (!timeRange || potentialTimeRangeFilterIris.length === 0) &&
        (!dataFilters || potentialDataFilterIris.length === 0)
      ) {
        return null;
      }

      return (
        <ControlSection
          role="tablist"
          aria-labelledby="controls-design"
          collapse
        >
          <SubsectionTitle
            titleId="controls-design"
            disabled={false}
            gutterBottom={false}
          >
            <Trans id="controls.section.shared-filters">Shared filters</Trans>
          </SubsectionTitle>
          <ControlSectionContent>
            <Stack gap="0.5rem">
              {/* TODO: allow TemporalOrdinalDimensions to work here */}
              {timeRange && combinedTemporalDimension.values.length ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="body2">
                      {combinedTemporalDimension.label}
                    </Typography>
                    <Switch
                      checked={timeRange.active}
                      onChange={handleTimeRangeFilterToggle}
                    />
                  </Box>
                  {timeRange.active ? (
                    <DashboardFiltersOptions
                      timeRangeFilter={timeRange}
                      timeRangeCombinedDimension={combinedTemporalDimension}
                    />
                  ) : null}
                </>
              ) : null}
              {dataFilters ? (
                <>
                  {potentialDataFilterIris.map((componentIri, i) => {
                    const dimension = dimensions.find(
                      (dimension) => dimension.iri === componentIri
                    );
                    if (!dimension) {
                      return null;
                    }
                    const checked = dataFilters.componentIris.includes(
                      dimension.iri
                    );
                    return (
                      <Box
                        key={dimension.iri}
                        sx={{ display: "flex", flexDirection: "column" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2">
                            {dimension.label}
                          </Typography>
                          <Switch
                            checked={checked}
                            onChange={(_, checked) => {
                              handleDataFiltersToggle(checked, dimension.iri);
                            }}
                          />
                        </Box>
                        {checked ? (
                          <Box sx={{ mb: 1 }}>
                            <DataFilterSelectGeneric
                              key={dimension.iri}
                              rawDimension={dimension}
                              filterDimensionIris={[]}
                              index={i}
                              disabled={fetching}
                              disableLabel
                            />
                          </Box>
                        ) : null}
                      </Box>
                    );
                  })}
                </>
              ) : null}
            </Stack>
          </ControlSectionContent>
        </ControlSection>
      );
    default:
      return null;
  }
};

const DashboardFiltersOptions = ({
  timeRangeFilter,
  timeRangeCombinedDimension,
}: {
  timeRangeFilter: DashboardTimeRangeFilter | undefined;
  timeRangeCombinedDimension: Dimension;
}) => {
  if (!timeRangeFilter) {
    return null;
  }

  if (
    !canDimensionBeTimeFiltered(timeRangeCombinedDimension) ||
    !canRenderDatePickerField(timeRangeCombinedDimension.timeUnit)
  ) {
    return null;
  }

  return (
    <DashboardTimeRangeFilterOptions
      filter={timeRangeFilter}
      dimension={timeRangeCombinedDimension}
    />
  );
};

const DashboardTimeRangeFilterOptions = ({
  filter,
  dimension,
}: {
  filter: DashboardTimeRangeFilter;
  dimension: TemporalDimension | TemporalEntityDimension;
}) => {
  const { timeUnit, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);
  const [state, dispatch] = useConfiguratorState();
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();

  const { minDate, maxDate, optionValues, options } = useMemo(() => {
    return extractDataPickerOptionsFromDimension({
      dimension,
      parseDate,
    });
  }, [dimension, parseDate]);

  const updateChartStoresFrom = useCallback(
    (newDate: Date) => {
      Object.entries(dashboardInteractiveFilters.stores).forEach(
        ([chartKey, [getInteractiveFiltersState]]) => {
          const { interactiveFiltersConfig } = getChartConfig(state, chartKey);
          const interactiveFiltersState = getInteractiveFiltersState();
          const { from, to } = interactiveFiltersState.timeRange;
          const setTimeRangeFilter = interactiveFiltersState.setTimeRange;
          if (from && to && interactiveFiltersConfig?.timeRange.componentIri) {
            setTimeRangeFilter(newDate, to);
          }
        }
      );
    },
    [dashboardInteractiveFilters.stores, state]
  );

  const updateChartStoresTo = useCallback(
    (newDate: Date) => {
      Object.entries(dashboardInteractiveFilters.stores).forEach(
        ([chartKey, [getInteractiveFiltersState]]) => {
          const { interactiveFiltersConfig } = getChartConfig(state, chartKey);
          const interactiveFiltersState = getInteractiveFiltersState();
          const { from, to } = interactiveFiltersState.timeRange;
          const setTimeRangeFilter = interactiveFiltersState.setTimeRange;
          if (from && to && interactiveFiltersConfig?.timeRange.componentIri) {
            setTimeRangeFilter(from, newDate);
          }
        }
      );
    },
    [dashboardInteractiveFilters.stores, state]
  );

  const handleChangeFromDate: DatePickerFieldProps["onChange"] = (ev) => {
    const newDate = parseDate(ev.target.value);
    if (!newDate) {
      return;
    }
    dispatch({
      type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
      value: {
        ...filter,
        presets: {
          ...filter.presets,
          from: formatDate(newDate),
        },
      },
    });
    updateChartStoresFrom(newDate);
  };

  const handleChangeFromGeneric: DataFilterGenericDimensionProps["onChange"] = (
    ev
  ) => {
    dispatch({
      type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
      value: {
        ...filter,
        presets: {
          ...filter.presets,
          from: ev.target.value as string,
        },
      },
    });
    const parsedDate = parseDate(ev.target.value as string);
    if (parsedDate) {
      updateChartStoresFrom(parsedDate);
    }
  };

  const handleChangeToDate: DatePickerFieldProps["onChange"] = (ev) => {
    const newDate = parseDate(ev.target.value);
    if (!newDate) {
      return;
    }
    dispatch({
      type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
      value: {
        ...filter,
        presets: {
          ...filter.presets,
          to: formatDate(newDate),
        },
      },
    });
    updateChartStoresTo(newDate);
  };

  const handleChangeToGeneric: DataFilterGenericDimensionProps["onChange"] = (
    ev
  ) => {
    dispatch({
      type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
      value: {
        ...filter,
        presets: {
          ...filter.presets,
          to: ev.target.value as string,
        },
      },
    });
    const parsedDate = parseDate(ev.target.value as string);
    if (parsedDate) {
      updateChartStoresTo(parsedDate);
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        gap="0.5rem"
        alignItems="center"
        divider={
          <Box position="relative" top="0.5rem">
            -
          </Box>
        }
      >
        {canRenderDatePickerField(timeUnit) ? (
          <DatePickerField
            name="dashboard-time-range-filter-from"
            value={parseDate(filter.presets.from) as Date}
            onChange={handleChangeFromDate}
            isDateDisabled={(date) => !optionValues.includes(formatDate(date))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.from", message: "From" })}
            parseDate={parseDate}
          />
        ) : (
          <Select
            id="dashboard-time-range-filter-from"
            label={t({ id: "controls.filters.select.from", message: "From" })}
            options={options}
            value={filter.presets.from}
            onChange={handleChangeFromGeneric}
          />
        )}
        {canRenderDatePickerField(timeUnit) ? (
          <DatePickerField
            name="dashboard-time-range-filter-to"
            value={parseDate(filter.presets.to) as Date}
            onChange={handleChangeToDate}
            isDateDisabled={(date) => !optionValues.includes(formatDate(date))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.to", message: "To" })}
            parseDate={parseDate}
          />
        ) : (
          <Select
            id="dashboard-time-range-filter-to"
            label={t({ id: "controls.filters.select.to", message: "To" })}
            options={options}
            value={filter.presets.to}
            onChange={handleChangeToGeneric}
          />
        )}
      </Stack>
    </div>
  );
};

const migrateLayout = (
  layout: LayoutDashboard,
  newLayoutType: LayoutDashboard["layout"],
  chartConfigs: ChartConfig[]
): LayoutDashboard => {
  if (newLayoutType === "canvas") {
    const defaultLayout = generateLayout({
      count: chartConfigs.length,
      layout: "tiles",
    }).map((l, i) => ({
      ...l,
      i: chartConfigs[i].key,
    }));
    const layouts: Record<
      keyof typeof FREE_CANVAS_BREAKPOINTS,
      ReactGridLayoutType[]
    > = {
      xl: defaultLayout,
      lg: defaultLayout,
      md: defaultLayout,
      sm: defaultLayout,
    };
    return {
      ...layout,
      layout: newLayoutType,
      layouts,
      layoutsMetadata: Object.fromEntries(
        chartConfigs.map(({ key }) => [key, { initialized: false }])
      ),
    };
  } else {
    return {
      ...omit(layout, "layouts"),
      layout: newLayoutType,
    };
  }
};

const DashboardLayoutButton = ({
  type,
  layout,
}: {
  type: LayoutDashboard["layout"];
  layout: LayoutDashboard;
}) => {
  const [config, dispatch] = useConfiguratorState(isLayouting);
  const ref = useRef<LayoutDashboard>();
  const checked = layout.layout === type;
  useEffect(() => {
    if (checked) {
      ref.current = layout;
    }
  }, [layout, checked]);
  const handleClick = useEventCallback(() => {
    if (ref.current?.layout === type) {
      dispatch({
        type: "LAYOUT_CHANGED",
        value: ref.current,
      });
    } else {
      dispatch({
        type: "LAYOUT_CHANGED",
        value: migrateLayout(layout, type, config.chartConfigs),
      });
    }
  });

  return (
    <IconButton
      label={`layout${capitalize(type)}`}
      checked={checked}
      onClick={handleClick}
    />
  );
};
