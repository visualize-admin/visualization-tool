import { Trans, t } from "@lingui/macro";
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  Typography,
  useEventCallback,
} from "@mui/material";
import capitalize from "lodash/capitalize";
import keyBy from "lodash/keyBy";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

import { DataFilterGenericDimensionProps } from "@/charts/shared/chart-data-filters";
import { Select } from "@/components/form";
import { generateLayout } from "@/components/react-grid";
import { ChartConfig, LayoutDashboard } from "@/config-types";
import { LayoutAnnotator } from "@/configurator/components/annotators";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  DatePickerField,
  DatePickerFieldProps,
  canRenderDatePickerField,
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
  Dimension,
  TemporalDimension,
  TemporalEntityDimension,
  canDimensionBeTimeFiltered,
  isJoinByComponent,
} from "@/domain/data";
import { useFlag } from "@/flags";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/src";
import {
  SharedFilter,
  useDashboardInteractiveFilters,
} from "@/stores/interactive-filters";
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
  const { sharedFilters, potentialSharedFilters } =
    useDashboardInteractiveFilters();
  const locale = useLocale();
  const cubeFilters = useMemo(() => {
    return uniqBy(
      state.chartConfigs.flatMap((config) =>
        config.cubes.map((x) => ({
          iri: x.iri,
          joinBy: x.joinBy,
          loadValues: true,
        }))
      ),
      "iri"
    );
  }, [state.chartConfigs]);
  const [data] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale: locale,
      cubeFilters: cubeFilters,
    },
  });

  const dimensionsByIri = useMemo(() => {
    const res: Record<string, Dimension> = {};
    for (const dim of data.data?.dataCubesComponents.dimensions ?? []) {
      res[dim.iri] = dim;
      if (isJoinByComponent(dim)) {
        for (const o of dim.originalIris) {
          res[o.dimensionIri] = dim;
        }
      }
    }
    return res;
  }, [data.data?.dataCubesComponents.dimensions]);

  const sharedFiltersByIri = useMemo(() => {
    return keyBy(sharedFilters, (x) => x.componentIri);
  }, [sharedFilters]);

  const formatLocale = useTimeFormatLocale();
  const timeFormatUnit = useTimeFormatUnit();

  const handleToggle: SwitchProps["onChange"] = useEventCallback(
    (event, checked) => {
      const componentIri = event.currentTarget.dataset.componentIri;
      const dimension = componentIri
        ? dimensionsByIri[componentIri]
        : undefined;

      if (
        !componentIri ||
        !dimension ||
        !canDimensionBeTimeFiltered(dimension)
      ) {
        return;
      }

      if (checked) {
        const options = getTimeFilterOptions({
          dimension: dimension,
          formatLocale,
          timeFormatUnit,
        });

        const from = options.sortedOptions[0].date;
        const to = options.sortedOptions.at(-1)?.date;
        const dateFormatter = timeUnitToFormatter[dimension.timeUnit];

        if (!from || !to) {
          return;
        }

        dispatch({
          type: "DASHBOARD_FILTER_ADD",
          value: {
            type: "timeRange",
            active: true,
            presets: {
              type: "range",
              from: dateFormatter(from),
              to: dateFormatter(to),
            },
            componentIri: componentIri,
          },
        });
      } else {
        dispatch({
          type: "DASHBOARD_FILTER_REMOVE",
          value: componentIri,
        });
      }
    }
  );

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
            <Trans id="controls.section.shared-filters">Shared filters</Trans>
          </SubsectionTitle>
          <ControlSectionContent>
            <Stack gap="0.5rem">
              {potentialSharedFilters.map((filter) => {
                const dimension = dimensionsByIri[filter.componentIri];
                const sharedFilter = sharedFiltersByIri[filter.componentIri];

                if (!dimension || !canDimensionBeTimeFiltered(dimension)) {
                  return null;
                }
                return (
                  <>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                      key={filter.componentIri}
                    >
                      <Typography variant="body2" flexGrow={1}>
                        {dimension.label || filter.componentIri}
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
                            checked={!!sharedFilter}
                            onChange={handleToggle}
                            inputProps={{
                              // @ts-expect-error ts(2322) - data-component-iri is not considered a valid attribute, while it is
                              "data-component-iri": filter.componentIri,
                            }}
                          />
                        }
                      />
                    </Box>
                    <SharedFilterOptions
                      sharedFilter={sharedFilter}
                      dimension={dimension}
                    />
                  </>
                );
              })}
            </Stack>
          </ControlSectionContent>
        </ControlSection>
      );
    default:
      return null;
  }
};

const SharedFilterOptions = ({
  sharedFilter,
  dimension,
}: {
  sharedFilter: SharedFilter;
  dimension: Dimension;
}) => {
  if (!sharedFilter) {
    return null;
  }

  if (sharedFilter.type !== "timeRange") {
    return null;
  }

  if (
    !canDimensionBeTimeFiltered(dimension) ||
    !canRenderDatePickerField(dimension.timeUnit)
  ) {
    return null;
  }

  return (
    <SharedFilterOptionsTimeRange
      sharedFilter={sharedFilter}
      dimension={dimension}
    />
  );
};

const SharedFilterOptionsTimeRange = ({
  sharedFilter,
  dimension,
}: {
  sharedFilter: SharedFilter;
  dimension: TemporalDimension | TemporalEntityDimension;
}) => {
  const { timeUnit, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);
  const [, dispatch] = useConfiguratorState();

  const { minDate, maxDate, optionValues, options } = useMemo(() => {
    return extractDataPickerOptionsFromDimension({
      dimension,
      parseDate,
    });
  }, [dimension, parseDate]);

  const handleChangeFromDate: DatePickerFieldProps["onChange"] = (ev) => {
    dispatch({
      type: "DASHBOARD_FILTER_UPDATE",
      value: {
        ...sharedFilter,
        presets: {
          ...sharedFilter.presets,
          from: formatDate(new Date(ev.target.value)),
        },
      },
    });
  };

  const handleChangeFromGeneric: DataFilterGenericDimensionProps["onChange"] = (
    ev
  ) =>
    dispatch({
      type: "DASHBOARD_FILTER_UPDATE",
      value: {
        ...sharedFilter,
        presets: {
          ...sharedFilter.presets,
          from: ev.target.value as string,
        },
      },
    });

  const handleChangeToDate: DatePickerFieldProps["onChange"] = (ev) =>
    dispatch({
      type: "DASHBOARD_FILTER_UPDATE",
      value: {
        ...sharedFilter,
        presets: {
          ...sharedFilter.presets,
          to: formatDate(new Date(ev.target.value)),
        },
      },
    });

  const handleChangeToGeneric: DataFilterGenericDimensionProps["onChange"] = (
    ev
  ) =>
    dispatch({
      type: "DASHBOARD_FILTER_UPDATE",
      value: {
        ...sharedFilter,
        presets: {
          ...sharedFilter.presets,
          to: ev.target.value as string,
        },
      },
    });

  return (
    <Stack spacing={1} direction="column" gap="0.25rem">
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
            name={`interactive-date-picker-${dimension.iri}`}
            value={parseDate(sharedFilter.presets.from) as Date}
            onChange={handleChangeFromDate}
            isDateDisabled={(d) => !optionValues.includes(formatDate(d))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.from", message: "From" })}
          />
        ) : (
          <Select
            id={`shared-filter-${sharedFilter.componentIri}-from`}
            label={t({ id: "controls.filters.select.from", message: "From" })}
            options={options}
            value={sharedFilter.presets.from}
            onChange={handleChangeFromGeneric}
          />
        )}
        {canRenderDatePickerField(timeUnit) ? (
          <DatePickerField
            name={`interactive-date-picker-${dimension.iri}`}
            value={parseDate(sharedFilter.presets.to) as Date}
            onChange={handleChangeToDate}
            isDateDisabled={(d) => !optionValues.includes(formatDate(d))}
            timeUnit={timeUnit}
            dateFormat={formatDate}
            minDate={minDate}
            maxDate={maxDate}
            label={t({ id: "controls.filters.select.to", message: "To" })}
          />
        ) : (
          <Select
            id={`shared-filter-${sharedFilter.componentIri}-to`}
            label={t({ id: "controls.filters.select.to", message: "To" })}
            options={options}
            value={sharedFilter.presets.to}
            onChange={handleChangeToGeneric}
          />
        )}
      </Stack>
    </Stack>
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
