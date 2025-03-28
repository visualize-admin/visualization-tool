import { t, Trans } from "@lingui/macro";
import {
  Box,
  Menu,
  MenuItem,
  Stack,
  Switch,
  SwitchProps,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import capitalize from "lodash/capitalize";
import omit from "lodash/omit";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DataFilterGenericDimensionProps } from "@/charts/shared/chart-data-filters";
import { useCombinedTemporalDimension } from "@/charts/shared/use-combined-temporal-dimension";
import { AddButton } from "@/components/add-button";
import { Select } from "@/components/form";
import { Markdown } from "@/components/markdown";
import {
  FREE_CANVAS_BREAKPOINTS,
  generateLayout,
} from "@/components/react-grid";
import {
  DashboardTimeRangeFilter,
  LayoutDashboard,
  LayoutTextBlock,
  ReactGridLayoutType,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { LayoutAnnotator } from "@/configurator/components/annotators";
import { DataFilterSelectGeneric } from "@/configurator/components/chart-configurator";
import { ControlTab } from "@/configurator/components/chart-controls/control-tab";
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
import { timeUnitToFormatter } from "@/configurator/components/ui-helpers";
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
import { Icon } from "@/icons";
import { useLocale } from "@/src";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";
import { createId } from "@/utils/create-id";
import { getTimeFilterOptions } from "@/utils/time-filter-options";
import useEvent from "@/utils/use-event";

export const LayoutConfigurator = () => {
  return (
    <>
      <LayoutAnnotator />
      <LayoutLayoutConfigurator />
      <LayoutSharedFiltersConfigurator />
      <LayoutBlocksConfigurator />
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
          aria-labelledby="controls-layout-options"
          collapse
        >
          <SubsectionTitle
            titleId="controls-layout-options"
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
  const { potentialTimeRangeFilterIds, potentialDataFilterIds } =
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

  const handleTimeRangeFilterToggle: SwitchProps["onChange"] = useEvent(
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

  const handleDataFiltersToggle = useEvent(
    (checked: boolean, componentId: string) => {
      if (checked) {
        dispatch({
          type: "DASHBOARD_DATA_FILTERS_SET",
          value: {
            componentIds: dataFilters?.componentIds
              ? [...dataFilters.componentIds, componentId].sort((a, b) => {
                  const aIndex =
                    dimensions.find((d) => d.id === a)?.order ??
                    dimensions.findIndex((d) => d.id === a) ??
                    0;
                  const bIndex =
                    dimensions.find((d) => d.id === b)?.order ??
                    dimensions.findIndex((d) => d.id === b) ??
                    0;
                  return aIndex - bIndex;
                })
              : [componentId],
            filters: dataFilters?.filters ?? {},
          },
        });
        const value = dimensions.find((d) => d.id === componentId)?.values[0]
          .value as string;
        dispatch({
          type: "FILTER_SET_SINGLE",
          value: {
            filters: [{ cubeIri: "", dimensionId: componentId }],
            value,
          },
        });
      } else {
        dispatch({
          type: "DASHBOARD_DATA_FILTER_REMOVE",
          value: {
            dimensionId: componentId,
          },
        });
        dispatch({
          type: "FILTER_REMOVE_SINGLE",
          value: {
            filters: [{ cubeIri: "", dimensionId: componentId }],
          },
        });
      }
    }
  );

  switch (layout.type) {
    case "tab":
    case "dashboard":
      if (
        (!timeRange || potentialTimeRangeFilterIds.length === 0) &&
        (!dataFilters || potentialDataFilterIds.length === 0)
      ) {
        return null;
      }

      return (
        <ControlSection
          role="tablist"
          aria-labelledby="controls-shared-filters"
          collapse
        >
          <SubsectionTitle
            titleId="controls-shared-filters"
            disabled={false}
            gutterBottom={false}
          >
            <Trans id="controls.section.shared-filters">Shared filters</Trans>
          </SubsectionTitle>
          <ControlSectionContent>
            <Stack gap="0.5rem">
              {timeRange && combinedTemporalDimension.values.length ? (
                <>
                  <div
                    style={{
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
                      data-testid="dashboard-time-range-filter-toggle"
                      checked={timeRange.active}
                      onChange={handleTimeRangeFilterToggle}
                    />
                  </div>
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
                  {potentialDataFilterIds.map((id, i) => {
                    const dim = dimensions.find((d) => d.id === id);

                    if (!dim) {
                      return null;
                    }

                    const checked = dataFilters.componentIds.includes(dim.id);

                    return (
                      <div
                        key={dim.id}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2">{dim.label}</Typography>
                          <Switch
                            checked={checked}
                            onChange={(_, checked) => {
                              handleDataFiltersToggle(checked, dim.id);
                            }}
                          />
                        </div>
                        {checked ? (
                          <Box sx={{ mb: 1 }}>
                            <DataFilterSelectGeneric
                              rawDimension={dim}
                              filterDimensionIds={[]}
                              index={i}
                              disabled={fetching}
                              disableLabel
                            />
                          </Box>
                        ) : null}
                      </div>
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
  const timeFormatUnit = useTimeFormatUnit();
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);
  const [state, dispatch] = useConfiguratorState();
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();

  const { sortedOptions, sortedValues } = useMemo(() => {
    return getTimeFilterOptions({
      dimension,
      formatLocale,
      timeFormatUnit,
    });
  }, [dimension, formatLocale, timeFormatUnit]);

  const minDate = sortedOptions[0].date;
  const maxDate = sortedOptions[sortedOptions.length - 1].date;
  const timeRange = [
    parseDate(filter.presets.from) as Date,
    parseDate(filter.presets.to) as Date,
  ];

  const updateChartStoresFrom = useCallback(
    (newDate: Date) => {
      Object.entries(dashboardInteractiveFilters.stores).forEach(
        ([chartKey, [getInteractiveFiltersState]]) => {
          const { interactiveFiltersConfig } = getChartConfig(state, chartKey);
          const interactiveFiltersState = getInteractiveFiltersState();
          const { from, to } = interactiveFiltersState.timeRange;
          const setTimeRangeFilter = interactiveFiltersState.setTimeRange;
          if (from && to && interactiveFiltersConfig?.timeRange.componentId) {
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
          if (from && to && interactiveFiltersConfig?.timeRange.componentId) {
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
        data-testid="dashboard-time-range-filters"
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
            value={timeRange[0]}
            onChange={handleChangeFromDate}
            isDateDisabled={(date) => {
              return (
                date > timeRange[1] || !sortedValues.includes(formatDate(date))
              );
            }}
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
            options={sortedOptions}
            value={filter.presets.from}
            onChange={handleChangeFromGeneric}
          />
        )}
        {canRenderDatePickerField(timeUnit) ? (
          <DatePickerField
            name="dashboard-time-range-filter-to"
            value={timeRange[1]}
            onChange={handleChangeToDate}
            isDateDisabled={(date) => {
              return (
                date < timeRange[0] || !sortedValues.includes(formatDate(date))
              );
            }}
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
            options={sortedOptions}
            value={filter.presets.to}
            onChange={handleChangeToGeneric}
          />
        )}
      </Stack>
    </div>
  );
};

const LayoutBlocksConfigurator = () => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { blocks } = layout;
  const classes = useLayoutBlocksStyles();
  const onClick = useEvent((blockKey: string) => {
    dispatch({ type: "LAYOUT_ACTIVE_FIELD_CHANGED", value: blockKey });
  });

  return layout.type === "dashboard" ? (
    <ControlSection role="tablist" aria-labelledby="controls-blocks" collapse>
      <SubsectionTitle titleId="controls-blocks" gutterBottom={false}>
        <Trans id="controls.section.block-options">Objects</Trans>
      </SubsectionTitle>
      <ControlSectionContent px="small" gap="none">
        <div className={classes.root}>
          {blocks
            .filter(
              (block): block is LayoutTextBlock & { initialized: boolean } =>
                block.type === "text"
            )
            .map((block) => (
              <ControlTab
                key={block.key}
                id={`tab-block-${block.key}`}
                mainLabel={
                  <div style={{ pointerEvents: "none" }}>
                    <Markdown>{block.text[locale]}</Markdown>
                  </div>
                }
                checked={state.layout.activeField === block.key}
                onClick={() => onClick(block.key)}
                value={state.layout.activeField ?? ""}
                icon="text"
                rightIcon={<Icon className={classes.tabRightIcon} name="pen" />}
              />
            ))}
        </div>
        <AddLayoutBlocks />
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

const useLayoutBlocksStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginBottom: theme.spacing(5),
  },
  tabRightIcon: {
    color: theme.palette.primary.main,
  },
}));

const AddLayoutBlocks = () => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpen = useEvent((e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  });
  const handleClose = useEvent(() => {
    setAnchorEl(null);
  });
  const handleAddTextBlock = useEvent(() => {
    const key = createId();
    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        blocks: [
          ...layout.blocks,
          {
            type: "text",
            key,
            text: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
            initialized: false,
          },
        ],
      },
    });
    dispatch({
      type: "LAYOUT_ACTIVE_FIELD_CHANGED",
      value: key,
    });
    handleClose();
  });
  const classes = useAddTextBlocksStyles();

  return (
    <>
      <AddButton onClick={handleOpen}>
        <Trans id="controls.section.block-options.block-add">Add object</Trans>
      </AddButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem className={classes.menuItem} onClick={handleAddTextBlock}>
          <Icon name="text" className={classes.menuItemIcon} />
          <Typography className={classes.menuItemText} variant="body2">
            <Trans id="controls.section.block-options.block-add.text">
              Add text
            </Trans>
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

const useAddTextBlocksStyles = makeStyles<Theme>((theme) => ({
  menuItem: {
    minWidth: 200,
    padding: theme.spacing(3),
  },
  menuItemIcon: {
    marginRight: "0.75rem",
  },
  menuItemText: {
    color: theme.palette.grey[700],
  },
}));

const migrateLayout = (
  layout: LayoutDashboard,
  newLayoutType: LayoutDashboard["layout"],
  blocks: LayoutDashboard["blocks"]
): LayoutDashboard => {
  if (newLayoutType === "canvas") {
    const defaultLayout = generateLayout({
      count: blocks.length,
      layout: "tiles",
    }).map((l, i) => ({
      ...l,
      i: blocks[i].key,
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
      blocks: blocks.map((block) => {
        return {
          ...block,
          initialized: false,
        };
      }),
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

    if (ref.current) {
      // Keep blocks in sync, so that they do not get lost when switching layouts.
      ref.current.blocks = layout.blocks;
    }
  }, [layout, checked]);
  const handleClick = useEvent(() => {
    if (ref.current?.layout === type) {
      dispatch({
        type: "LAYOUT_CHANGED",
        value: ref.current,
      });
    } else {
      dispatch({
        type: "LAYOUT_CHANGED",
        value: migrateLayout(layout, type, config.layout.blocks),
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
