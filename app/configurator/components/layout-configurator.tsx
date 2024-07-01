import { t, Trans } from "@lingui/macro";
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  Typography,
  useEventCallback,
} from "@mui/material";
import { ascending, descending } from "d3-array";
import capitalize from "lodash/capitalize";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import { useCallback, useMemo } from "react";

import { DataFilterGenericDimensionProps } from "@/charts/shared/chart-data-filters";
import { Select } from "@/components/form";
import { generateLayout } from "@/components/react-grid";
import {
  ChartConfig,
  DashboardTimeRangeFilter,
  getChartConfig,
  LayoutDashboard,
} from "@/config-types";
import { LayoutAnnotator } from "@/configurator/components/annotators";
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
  isTemporalDimensionWithTimeUnit,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useFlag } from "@/flags";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";
import { useConfigsCubeComponents } from "@/graphql/hooks";
import { TimeUnit } from "@/graphql/resolver-types";
import { timeUnitFormats, timeUnitOrder } from "@/rdf/mappings";
import { useLocale } from "@/src";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";
import { getTimeFilterOptions } from "@/utils/time-filter-options";

export const LayoutConfigurator = () => {
  const sharedFiltersFlag = useFlag("layouter.dashboard.shared-filters");
  return (
    <>
      <LayoutAnnotator />
      <LayoutLayoutConfigurator />
      {sharedFiltersFlag ? <LayoutSharedFiltersConfigurator /> : null}
    </>
  );
};

const LayoutLayoutConfigurator = () => {
  const [state] = useConfiguratorState(isLayouting);
  const { layout } = state;

  const freeCanvasFlag = useFlag("layouter.dashboard.free-canvas");

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
              <LayoutButton type="tall" layout={layout} />
              <LayoutButton type="vertical" layout={layout} />
              {freeCanvasFlag ? (
                <LayoutButton type="canvas" layout={layout} />
              ) : null}
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
  const { timeRange, potentialTimeRangeFilterIris } =
    useDashboardInteractiveFilters();

  const locale = useLocale();
  const [{ data }] = useConfigsCubeComponents({
    variables: {
      state,
      locale: locale,
    },
  });

  const formatLocale = useTimeFormatLocale();
  const timeFormatUnit = useTimeFormatUnit();

  const combinedDimension = useMemo(() => {
    const dimensions = data?.dataCubesComponents.dimensions ?? [];
    const timeUnitDimensions = dimensions.filter(
      (dimension) =>
        isTemporalDimensionWithTimeUnit(dimension) &&
        potentialTimeRangeFilterIris.includes(dimension.iri)
    ) as (TemporalDimension | TemporalEntityDimension)[];
    // We want to use lowest time unit for combined dimension filtering,
    // so in case we have year and day, we'd filter both by day
    const timeUnit = timeUnitDimensions.sort((a, b) =>
      descending(
        timeUnitOrder.get(a.timeUnit) ?? 0,
        timeUnitOrder.get(b.timeUnit) ?? 0
      )
    )[0]?.timeUnit as TimeUnit;
    const timeFormat = timeUnitFormats.get(timeUnit) as string;
    const values = timeUnitDimensions.flatMap((dimension) => {
      const formatDate = formatLocale.format(timeFormat);
      const parseDate = formatLocale.parse(dimension.timeFormat);
      // Standardize values to have same date format
      return dimension.values.map((dimensionValue) => {
        const value = formatDate(
          parseDate(dimensionValue.value as string) as Date
        );
        return {
          ...dimensionValue,
          value,
          label: value,
        };
      });
    });
    const combinedDimension: TemporalDimension = {
      __typename: "TemporalDimension",
      cubeIri: "all",
      iri: "combined-date-filter",
      label: t({
        id: "controls.section.shared-filters.date",
        message: "Date",
      }),
      isKeyDimension: true,
      isNumerical: false,
      values: uniqBy(values, "value").sort((a, b) =>
        ascending(a.value, b.value)
      ),
      timeUnit,
      timeFormat,
    };

    return combinedDimension;
  }, [
    data?.dataCubesComponents.dimensions,
    formatLocale,
    potentialTimeRangeFilterIris,
  ]);

  const handleToggle: SwitchProps["onChange"] = useEventCallback(
    (_, checked) => {
      if (checked) {
        const options = getTimeFilterOptions({
          dimension: combinedDimension,
          formatLocale,
          timeFormatUnit,
        });

        const from = options.sortedOptions[0].date;
        const to = options.sortedOptions.at(-1)?.date;
        const formatDate = timeUnitToFormatter[combinedDimension.timeUnit];

        if (!from || !to) {
          return;
        }

        dispatch({
          type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE",
          value: {
            active: true,
            timeUnit: combinedDimension.timeUnit,
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

  switch (layout.type) {
    case "tab":
    case "dashboard":
      if (!timeRange || potentialTimeRangeFilterIris.length === 0) {
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Typography variant="body2" flexGrow={1}>
                  {combinedDimension.label}
                </Typography>
                <FormControlLabel
                  sx={{ mr: 0 }}
                  labelPlacement="start"
                  disableTypography
                  label={
                    <Typography variant="body2">
                      <Trans id="controls.section.shared-filters.shared-switch">
                        Shared
                      </Trans>
                    </Typography>
                  }
                  control={
                    <Switch
                      checked={timeRange.active}
                      onChange={handleToggle}
                    />
                  }
                />
              </Box>
              {timeRange.active ? (
                <DashboardFiltersOptions
                  dimension={combinedDimension}
                  timeRangeFilter={timeRange}
                />
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
  dimension,
}: {
  timeRangeFilter: DashboardTimeRangeFilter | undefined;
  dimension: Dimension;
}) => {
  if (!timeRangeFilter) {
    return null;
  }

  if (
    !canDimensionBeTimeFiltered(dimension) ||
    !canRenderDatePickerField(dimension.timeUnit)
  ) {
    return null;
  }

  return (
    <DashboardTimeRangeFilterOptions
      timeRangeFilter={timeRangeFilter}
      dimension={dimension}
    />
  );
};

const DashboardTimeRangeFilterOptions = ({
  timeRangeFilter,
  dimension,
}: {
  timeRangeFilter: DashboardTimeRangeFilter;
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
        ...timeRangeFilter,
        presets: {
          ...timeRangeFilter.presets,
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
        ...timeRangeFilter,
        presets: {
          ...timeRangeFilter.presets,
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
        ...timeRangeFilter,
        presets: {
          ...timeRangeFilter.presets,
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
        ...timeRangeFilter,
        presets: {
          ...timeRangeFilter.presets,
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
            value={parseDate(timeRangeFilter.presets.from) as Date}
            onChange={handleChangeFromDate}
            isDateDisabled={(date) => !optionValues.includes(formatDate(date))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.from", message: "From" })}
          />
        ) : (
          <Select
            id="dashboard-time-range-filter-from"
            label={t({ id: "controls.filters.select.from", message: "From" })}
            options={options}
            value={timeRangeFilter.presets.from}
            onChange={handleChangeFromGeneric}
          />
        )}
        {canRenderDatePickerField(timeUnit) ? (
          <DatePickerField
            name="dashboard-time-range-filter-to"
            value={parseDate(timeRangeFilter.presets.to) as Date}
            onChange={handleChangeToDate}
            isDateDisabled={(date) => !optionValues.includes(formatDate(date))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.to", message: "To" })}
          />
        ) : (
          <Select
            id="dashboard-time-range-filter-to"
            label={t({ id: "controls.filters.select.to", message: "To" })}
            options={options}
            value={timeRangeFilter.presets.to}
            onChange={handleChangeToGeneric}
          />
        )}
      </Stack>
    </div>
  );
};

type LayoutButtonProps = {
  type: LayoutDashboard["layout"];
  layout: LayoutDashboard;
};

const migrateLayout = (
  layout: LayoutDashboard,
  newLayoutType: LayoutDashboard["layout"],
  chartConfigs: ChartConfig[]
): LayoutDashboard => {
  if (newLayoutType === "canvas") {
    const generated = generateLayout({
      count: chartConfigs.length,
      layout: "tiles",
    });
    return {
      ...layout,
      layout: newLayoutType,
      layouts: {
        lg: generated.map((l, i) => ({
          ...l,
          // We must pay attention to correctly change the i value to
          // chart config key, as it is used to identify the layout
          i: chartConfigs[i].key,
        })),
      },
    };
  } else {
    return {
      ...omit(layout, "layouts"),
      layout: newLayoutType,
    };
  }
};

const LayoutButton = (props: LayoutButtonProps) => {
  const { type, layout } = props;
  const [config, dispatch] = useConfiguratorState(isLayouting);

  return (
    <IconButton
      label={`layout${capitalize(type)}`}
      checked={layout.layout === type}
      onClick={() => {
        dispatch({
          type: "LAYOUT_CHANGED",
          value: migrateLayout(layout, type, config.chartConfigs),
        });
      }}
    />
  );
};
