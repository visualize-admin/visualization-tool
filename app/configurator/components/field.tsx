import { t, Trans } from "@lingui/macro";
import { Box, CircularProgress, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TimeLocaleObject } from "d3-time-format";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import pick from "lodash/pick";
import dynamic from "next/dynamic";
import {
  ChangeEvent,
  ComponentProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { LegendItem, LegendSymbol } from "@/charts/shared/legend-color";
import { Flex } from "@/components/flex";
import {
  Checkbox,
  CheckboxProps,
  FormControlLabel,
  Input,
  MarkdownInput,
  Radio,
  Select,
  SelectOption,
  SelectOptionGroup,
  Slider,
  Switch,
} from "@/components/form";
import { SelectTree } from "@/components/select-tree";
import { useDisclosure } from "@/components/use-disclosure";
import {
  ChartConfig,
  CustomPaletteType,
  isColorInConfig,
} from "@/config-types";
import { getChartConfig, useChartConfigFilters } from "@/config-utils";
import {
  ControlTab,
  ControlTabFieldInner,
  ControlTabProps,
  OnOffControlTab,
} from "@/configurator/components/chart-controls/control-tab";
import {
  DatePickerField,
  DatePickerTimeUnit,
} from "@/configurator/components/field-date-picker";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import {
  isMultiFilterFieldChecked,
  Option,
  useActiveChartField,
  useActiveLayoutField,
  useChartFieldField,
  useChartOptionBooleanField,
  useChartOptionRadioField,
  useChartOptionSelectField,
  useChartOptionSliderField,
  useMetaField,
  useMultiFilterContext,
  useSingleFilterField,
  useSingleFilterSelect,
} from "@/configurator/config-form";
import {
  isConfiguring,
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Component,
  Dimension,
  HierarchyValue,
  isJoinByComponent,
  isTemporalOrdinalDimension,
  TemporalDimension,
} from "@/domain/data";
import {
  isMostRecentValue,
  VISUALIZE_MOST_RECENT_VALUE,
} from "@/domain/most-recent-value";
import { useTimeFormatLocale } from "@/formatters";
import { TimeUnit } from "@/graphql/query-hooks";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { ColorItem, getPalette } from "@/palettes";
import { assert } from "@/utils/assert";
import { hierarchyToOptions } from "@/utils/hierarchy";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import { useEvent } from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

const ColorPickerMenu = dynamic(
  () =>
    import("./chart-controls/color-picker").then((mod) => mod.ColorPickerMenu),
  { ssr: false }
);

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    gap: theme.spacing(1),
    textAlign: "left",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  loadingIndicator: {
    display: "inline-block",
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
}));

export const ControlTabField = ({
  chartConfig,
  fieldComponents,
  value,
  labelId,
  disabled,
  warnMessage,
}: {
  chartConfig: ChartConfig;
  fieldComponents?: Component[];
  value: string;
  labelId: string | null;
  disabled?: boolean;
  warnMessage?: string;
}) => {
  const field = useActiveChartField({ value });

  return (
    <ControlTabFieldInner
      chartConfig={chartConfig}
      fieldComponents={fieldComponents}
      value={`${field.value}`}
      labelId={labelId}
      checked={field.checked}
      onClick={field.onClick}
      disabled={disabled}
      warnMessage={warnMessage}
    />
  );
};

export const OnOffControlTabField = ({
  value,
  label,
  icon,
  active,
}: {
  value: string;
  label: ReactNode;
  icon: string;
  active?: boolean;
}) => {
  const { checked, onClick } = useActiveChartField({ value });

  return (
    <OnOffControlTab
      value={value}
      label={label}
      icon={icon}
      checked={checked}
      active={active}
      onClick={onClick}
    />
  );
};

export const DataFilterSelect = ({
  dimension,
  label,
  id,
  disabled,
  optional,
  sideControls,
  hierarchy,
  onOpen,
  loading,
}: {
  dimension: Dimension;
  label: ReactNode;
  id: string;
  disabled?: boolean;
  optional?: boolean;
  sideControls?: ReactNode;
  hierarchy?: HierarchyValue[] | null;
  onOpen?: () => void;
  loading?: boolean;
}) => {
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No Filter",
  });
  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(dimension);

    return orderBy(
      dimension.values,
      sorters.map((s) => (dv) => s(dv.label))
    );
  }, [dimension]);

  const allValues = useMemo(() => {
    return optional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...sortedValues,
        ]
      : sortedValues;
  }, [optional, sortedValues, noneLabel]);

  const hierarchyOptions = useMemo(() => {
    if (!hierarchy) {
      return;
    }

    return hierarchyToOptions(
      hierarchy,
      dimension.values.map((v) => v.value)
    );
  }, [hierarchy, dimension.values]);

  const { open, close, isOpen } = useDisclosure();
  const handleOpen = useEvent(() => {
    open();
    onOpen?.();
  });
  const handleClose = useEvent(() => {
    close();
  });

  if (hierarchy && hierarchyOptions) {
    return (
      <SelectTree
        label={<FieldLabel label={label} />}
        id={id}
        options={hierarchyOptions}
        onClose={handleClose}
        onOpen={handleOpen}
        open={isOpen}
        disabled={disabled}
        sideControls={sideControls}
        {...fieldProps}
      />
    );
  }

  const canUseMostRecentValue = isTemporalOrdinalDimension(dimension);
  const usesMostRecentValue = isMostRecentValue(fieldProps.value);
  // Dimension values can be empty just before a filter is reloaded through
  // ensurePossibleFilters
  const maxValue = sortedValues[sortedValues.length - 1]?.value;

  return (
    <Select
      id={id}
      size="sm"
      label={
        canUseMostRecentValue ? (
          <div style={{ width: "100%" }}>
            <Flex justifyContent="flex-end" sx={{ mb: 0.5, mr: 7 }}>
              <Switch
                label={t({
                  id: "controls.filter.use-most-recent",
                  message: "Use most recent",
                })}
                size="sm"
                checked={usesMostRecentValue}
                onChange={() =>
                  fieldProps.onChange({
                    target: {
                      value: usesMostRecentValue
                        ? `${maxValue}`
                        : VISUALIZE_MOST_RECENT_VALUE,
                    },
                  })
                }
              />
            </Flex>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              gap={1}
              width="100%"
            >
              {label}
            </Flex>
          </div>
        ) : (
          <FieldLabel label={label} />
        )
      }
      disabled={disabled || usesMostRecentValue}
      options={allValues}
      sort={false}
      sideControls={sideControls}
      open={isOpen}
      onClose={handleClose}
      onOpen={handleOpen}
      loading={loading}
      {...fieldProps}
      value={usesMostRecentValue ? maxValue : fieldProps.value}
    />
  );
};

export const dimensionToFieldProps = (dim: Component) => {
  return isJoinByComponent(dim)
    ? dim.originalIds.map((o) => pick(o, ["cubeIri", "dimensionId"]))
    : [{ dimensionId: dim.id, cubeIri: dim.cubeIri }];
};

export const DataFilterTemporal = ({
  label: _label,
  dimension,
  timeUnit,
  disabled,
  isOptional,
  sideControls,
}: {
  label: ReactNode;
  dimension: TemporalDimension;
  timeUnit: DatePickerTimeUnit;
  disabled?: boolean;
  isOptional?: boolean;
  sideControls?: ReactNode;
}) => {
  const { values, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
  const usesMostRecentDate = isMostRecentValue(fieldProps.value);
  const label = isOptional ? (
    <span>
      {_label}{" "}
      <span style={{ marginLeft: "0.25rem" }}>
        (<Trans id="controls.select.optional">optional</Trans>)
      </span>
    </span>
  ) : (
    _label
  );
  const { minDate, maxDate, optionValues } = useMemo(() => {
    if (values.length) {
      const options = values.map((d) => {
        return {
          label: `${d.value}`,
          value: `${d.value}`,
        };
      });

      return {
        minDate: parseDate(`${values[0].value}`) as Date,
        maxDate: parseDate(`${values[values.length - 1].value}`) as Date,
        optionValues: options.map((d) => d.value),
      };
    } else {
      const date = new Date();
      return {
        minDate: date,
        maxDate: date,
        optionValues: [],
      };
    }
  }, [values, parseDate]);
  const isDateDisabled = useCallback(
    (date: Date) => {
      return !optionValues.includes(formatDate(date));
    },
    [optionValues, formatDate]
  );

  return (
    <>
      <DatePickerField
        name={`date-picker-${dimension.id}`}
        label={<FieldLabel label={label} />}
        value={
          usesMostRecentDate ? maxDate : (parseDate(fieldProps.value) as Date)
        }
        onChange={fieldProps.onChange}
        isDateDisabled={isDateDisabled}
        timeUnit={timeUnit}
        dateFormat={formatDate}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled || usesMostRecentDate}
        sideControls={sideControls}
        parseDate={parseDate}
      />
      <Box sx={{ mt: 3 }}>
        <Switch
          label={t({
            id: "controls.filter.use-most-recent",
            message: "Use most recent",
          })}
          size="sm"
          checked={usesMostRecentDate}
          onChange={() =>
            fieldProps.onChange({
              target: {
                value: usesMostRecentDate
                  ? formatDate(maxDate)
                  : VISUALIZE_MOST_RECENT_VALUE,
              },
            })
          }
        />
      </Box>
    </>
  );
};

export const DataFilterSelectTime = ({
  dimension,
  label,
  from,
  to,
  timeUnit,
  timeFormat,
  id,
  disabled,
}: {
  dimension: Dimension;
  label: ReactNode;
  from: string;
  to: string;
  timeUnit: TimeUnit;
  timeFormat: string;
  id: string;
  disabled?: boolean;
}) => {
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
  const formatLocale = useTimeFormatLocale();

  const timeIntervalWithProps = useMemo(() => {
    return getTimeIntervalWithProps(
      from,
      to,
      timeUnit,
      timeFormat,
      formatLocale
    );
  }, [from, to, timeUnit, timeFormat, formatLocale]);

  const options = useMemo(() => {
    return timeIntervalWithProps.range > 100
      ? []
      : getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);
  }, [timeIntervalWithProps]);

  if (options.length) {
    return (
      <Select
        id={id}
        size="sm"
        label={label}
        disabled={disabled}
        options={options}
        sort={false}
        {...fieldProps}
      />
    );
  }

  return (
    <TimeInput
      id={id}
      label={label}
      value={fieldProps.value}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={false}
      onChange={fieldProps.onChange}
    />
  );
};

export const TimeInput = ({
  id,
  label,
  value,
  timeFormat,
  formatLocale,
  isOptional,
  onChange,
}: {
  id: string;
  label: ReactNode;
  value: string | undefined;
  timeFormat: string;
  formatLocale: TimeLocaleObject;
  isOptional: boolean | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [inputValue, setInputValue] = useState(
    value === FIELD_VALUE_NONE ? undefined : value
  );

  const [parseDateValue, formatDateValue] = useMemo(
    () => [formatLocale.parse(timeFormat), formatLocale.format(timeFormat)],
    [timeFormat, formatLocale]
  );

  const onInputChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      setInputValue(e.currentTarget.value);

      if (e.currentTarget.value === "") {
        if (isOptional) {
          onChange(e);
        } else {
          setInputValue(value);
        }
      } else {
        const parsed = parseDateValue(e.currentTarget.value);
        const isValidDate =
          parsed !== null && formatDateValue(parsed) === e.currentTarget.value;

        if (isValidDate) {
          onChange(e);
        }
      }
    },
    [formatDateValue, onChange, parseDateValue, value, isOptional]
  );

  return (
    <Input
      name={id}
      label={label}
      value={inputValue}
      onChange={onInputChange}
    />
  );
};

type AnnotatorTabFieldProps<T extends string = string> = {
  value: T;
  emptyValueWarning?: ReactNode;
} & Omit<ControlTabProps, "onClick" | "value">;

export const ChartAnnotatorTabField = (props: AnnotatorTabFieldProps) => {
  const { value, emptyValueWarning, ...tabProps } = props;
  const fieldProps = useActiveChartField({ value });
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const locale = useLocale();

  return (
    <ControlTab
      {...tabProps}
      lowerLabel={
        (chartConfig.meta as any)[value]?.[locale] ? null : (
          <Typography variant="caption" color="orange.main">
            {emptyValueWarning}
          </Typography>
        )
      }
      value={`${fieldProps.value}`}
      checked={fieldProps.checked}
      onClick={fieldProps.onClick}
    />
  );
};

export const LayoutAnnotatorTabField = (
  props: AnnotatorTabFieldProps<"title" | "description" | "label">
) => {
  const { value, emptyValueWarning, ...tabProps } = props;
  const fieldProps = useActiveLayoutField({ value });
  const [state] = useConfiguratorState(isLayouting);
  const locale = useLocale();

  return (
    <ControlTab
      {...tabProps}
      lowerLabel={
        state.layout.meta[value][locale] ? null : (
          <Typography variant="caption" color="orange.main">
            {emptyValueWarning}
          </Typography>
        )
      }
      value={`${fieldProps.value}`}
      checked={fieldProps.checked}
      onClick={fieldProps.onClick}
    />
  );
};

export const MetaInputField = ({
  type,
  inputType,
  label,
  metaKey,
  locale,
  value,
  disableToolbar,
}: {
  type: "chart" | "layout";
  inputType: "text" | "markdown";
  label: string | ReactNode;
  metaKey: string;
  locale: string;
  value?: string;
  disableToolbar?: ComponentProps<typeof MarkdownInput>["disableToolbar"];
}) => {
  const field = useMetaField({ type, metaKey, locale, value });

  switch (inputType) {
    case "text":
      return <Input label={label} {...field} />;
    case "markdown":
      return (
        <MarkdownInput
          label={label}
          {...field}
          disableToolbar={disableToolbar}
        />
      );
    default:
      const _exhaustiveCheck: never = inputType;
      return _exhaustiveCheck;
  }
};

export const TextBlockInputField = ({ locale }: { locale: Locale }) => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { blocks } = layout;
  const activeBlock = useMemo(() => {
    const activeBlock = blocks.find(
      (block) => block.key === layout.activeField
    );

    assert(
      activeBlock?.type === "text",
      "We can only edit text blocks from TextBlockInputField"
    );

    return activeBlock;
  }, [blocks, layout.activeField]);
  const handleChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.currentTarget.value;
      dispatch({
        type: "LAYOUT_CHANGED",
        value: {
          ...layout,
          blocks: blocks.map((b) =>
            b.key === activeBlock.key
              ? {
                  ...b,
                  text: {
                    ...activeBlock.text,
                    [locale]: text,
                  },
                }
              : b
          ),
        },
      });
    },
    [dispatch, layout, blocks, activeBlock.key, activeBlock.text, locale]
  );
  const label = getFieldLabel(locale);

  return (
    <MarkdownInput
      name={label}
      label={label}
      value={activeBlock.text[locale]}
      onChange={handleChanged}
    />
  );
};

const useMultiFilterColorPicker = (
  value: string,
  customColorPalettes?: CustomPaletteType[]
) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);
  const { dimensionId, colorConfigPath } = useMultiFilterContext();
  const { activeField } = chartConfig;

  const hasColorField = isColorInConfig(chartConfig);
  const colorField = hasColorField ? "color" : activeField;

  const onChange = useCallback(
    (color: string) => {
      if (colorField) {
        dispatch({
          type: "CHART_COLOR_CHANGED",
          value: {
            field: colorField,
            colorConfigPath: hasColorField ? "" : "color",
            color,
            value,
          },
        });
      }
    },

    [dispatch, colorField, value, hasColorField]
  );

  const path = colorConfigPath ? `color.${colorConfigPath}` : "";

  const color = get(
    chartConfig,
    `fields["${colorField}"].${path}${hasColorField ? "colorMapping" : ""}["${value}"]`
  );

  const palette = useMemo(() => {
    const paletteId = get(chartConfig, `fields["${colorField}"].paletteId`);

    return getPalette({
      paletteId,
      fallbackPalette: customColorPalettes?.find(
        (palette) => palette.paletteId === paletteId
      )?.colors,
    });
  }, [chartConfig, colorField, customColorPalettes]);

  const checked = dimensionId
    ? isMultiFilterFieldChecked(filters, dimensionId, value)
    : null;

  return useMemo(() => {
    return {
      color,
      palette,
      onChange,
      checked,
    };
  }, [color, palette, onChange, checked]);
};

export const MultiFilterField = ({
  value,
  label,
  symbol,
  enableShowValue,
}: {
  value: string;
  label: string;
  symbol: LegendSymbol;
  enableShowValue?: boolean;
}) => {
  const { data: customColorPalettes } = useUserPalettes();
  const { color, checked, palette, onChange } = useMultiFilterColorPicker(
    value,
    customColorPalettes
  );

  return color && checked ? (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        width: "100%",
      }}
    >
      <LegendItem symbol={symbol} label={label} color={color} />
      <Flex sx={{ alignItems: "center", gap: 1 }}>
        {enableShowValue ? <ShowValuesMappingField value={value} /> : null}
        <ColorPickerMenu
          colors={palette}
          selectedHexColor={color}
          onChange={onChange}
        />
      </Flex>
    </Flex>
  ) : null;
};

export const ShowValuesMappingField = ({ value }: { value: string }) => {
  return (
    <ChartOptionCheckboxField
      label={t({ id: "controls.filter.show-values", message: "Show value" })}
      size="sm"
      field="segment"
      path={`showValuesMapping["${value}"]`}
    />
  );
};

export const SingleFilterField = ({
  filters,
  label,
  value,
  disabled,
}: {
  filters: { cubeIri: string; dimensionId: string }[];
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({ filters, value });

  return <Radio label={label} disabled={disabled} {...field} />;
};

export const ColorPicker = ({
  label,
  color,
  symbol,
  colors,
  onChange,
  disabled,
}: {
  label: string;
  color: string;
  symbol: LegendSymbol;
  colors?: ColorItem[] | readonly string[];
  onChange: (color: string) => void;
  disabled?: boolean;
}) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <LegendItem label={label} color={color} symbol={symbol} />
      <ColorPickerMenu
        colors={colors}
        selectedHexColor={color}
        onChange={onChange}
        disabled={disabled}
      />
    </Flex>
  );
};

export const ColorPickerField = ({
  symbol = "square",
  field,
  path,
  label,
  disabled,
}: {
  symbol?: LegendSymbol;
  field: EncodingFieldType;
  path: string;
  label: string;
  disabled?: boolean;
}) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const updateColor = useCallback(
    (value: string) =>
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field,
          path,
          value,
        },
      }),
    [locale, dispatch, field, path]
  );

  const { data: customColorPalettes } = useUserPalettes();
  const paletteId = get(chartConfig, `fields["${field}"].paletteId`);

  const color = get(chartConfig, `fields["${field}"].${path}`);
  const palette = getPalette({
    paletteId,
    fallbackPalette: customColorPalettes?.find(
      (palette) => palette.paletteId === paletteId
    )?.colors,
  });

  return (
    <ColorPicker
      label={label}
      color={color}
      symbol={symbol}
      colors={palette}
      onChange={updateColor}
      disabled={disabled}
    />
  );
};

export const LoadingIndicator = () => {
  const classes = useStyles();

  return <CircularProgress size={16} className={classes.loadingIndicator} />;
};

export const FieldLabel = ({
  label,
  isFetching,
}: {
  label: ReactNode;
  isFetching?: boolean;
}) => {
  const classes = useStyles();

  return (
    <Typography className={classes.root} variant="caption">
      {label}
      {isFetching ? <LoadingIndicator /> : null}
    </Typography>
  );
};

const getOptionsWithMaybeOptional = (
  options: SelectOption[],
  optional: boolean
): SelectOption[] => {
  return optional
    ? [
        {
          value: FIELD_VALUE_NONE,
          label: t({
            id: "controls.none",
            message: "None",
          }),
          isNoneValue: true,
        },
        ...options,
      ]
    : options;
};

const getOptionGroupsWithMaybeOptional = (
  optionGroups: SelectOptionGroup[],
  optional: boolean
): SelectOptionGroup[] | undefined => {
  return optional
    ? [
        [
          undefined,
          [
            {
              value: FIELD_VALUE_NONE,
              label: t({
                id: "controls.none",
                message: "None",
              }),
              isNoneValue: true,
            },
          ],
        ],
        ...optionGroups,
      ]
    : optionGroups;
};

export const ChartFieldField = ({
  label = "",
  field,
  options,
  optionGroups,
  optional,
  disabled,
  components,
}: {
  label?: string;
  field: EncodingFieldType;
  options: Option[];
  optionGroups?: SelectOptionGroup[];
  optional?: boolean;
  disabled?: boolean;
  components: Component[];
}) => {
  const props = useChartFieldField({ field, components });
  const allOptions = useMemo(() => {
    return getOptionsWithMaybeOptional(options, !!optional);
  }, [options, optional]);
  const allOptionGroups = useMemo(() => {
    return optionGroups
      ? getOptionGroupsWithMaybeOptional(optionGroups, !!optional)
      : undefined;
  }, [optionGroups, optional]);

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={<FieldLabel label={label} />}
      size="sm"
      disabled={disabled}
      options={allOptions}
      optionGroups={allOptionGroups}
      {...props}
    />
  );
};

export const ChartOptionRadioField = <V extends string | number>({
  label,
  field,
  path,
  value,
  defaultChecked,
  disabled = false,
  warnMessage,
}: {
  label: string;
  field: EncodingFieldType | null;
  path: string;
  value: V;
  defaultChecked?: boolean;
  disabled?: boolean;
  warnMessage?: string;
}) => {
  const fieldProps = useChartOptionRadioField({
    path,
    field,
    value,
  });

  return (
    <Radio
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
      warnMessage={warnMessage}
    />
  );
};

export const ChartOptionSliderField = ({
  label,
  field,
  path,
  disabled = false,
  min = 0,
  max = 1,
  step = 0.1,
  defaultValue,
}: {
  label: string;
  field: EncodingFieldType | null;
  path: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
}) => {
  const fieldProps = useChartOptionSliderField({
    path,
    field,
    min,
    max,
    defaultValue,
  });

  return (
    <Slider
      disabled={disabled}
      label={label}
      min={min}
      max={max}
      step={step}
      {...fieldProps}
    />
  );
};

export const ChartOptionCheckboxField = ({
  label,
  size,
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: string;
  size?: CheckboxProps["size"];
  field: EncodingFieldType | null;
  path: string;
  defaultValue?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionBooleanField({
    field,
    path,
    defaultValue,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      size={size}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};

type ChartOptionSelectFieldProps<V> = {
  id: string;
  label: string | ReactNode;
  field: EncodingFieldType;
  path: string;
  disabled?: boolean;
  options: Option[];
  optionGroups?: SelectOptionGroup[];
  getValue?: (x: string) => V | undefined;
  getKey?: (x: V) => string;
  optional?: boolean;
};

export const ChartOptionSelectField = <V extends {} = string>(
  props: ChartOptionSelectFieldProps<V>
) => {
  const {
    id,
    label,
    field,
    path,
    disabled = false,
    options,
    optionGroups,
    getValue,
    getKey,
    optional,
  } = props;
  const fieldProps = useChartOptionSelectField({
    field,
    path,
    getValue,
    getKey,
  });

  const allOptions: SelectOption[] = useMemo(() => {
    return getOptionsWithMaybeOptional(options, !!optional);
  }, [optional, options]);
  const allOptionGroups: SelectOptionGroup[] | undefined = useMemo(() => {
    return optionGroups
      ? getOptionGroupsWithMaybeOptional(optionGroups, !!optional)
      : undefined;
  }, [optional, optionGroups]);

  return (
    <Select
      id={id}
      disabled={disabled}
      size="sm"
      label={<FieldLabel isFetching={false} label={label} />}
      options={allOptions}
      optionGroups={allOptionGroups}
      {...fieldProps}
    />
  );
};

export const ChartOptionSwitchField = ({
  label,
  size,
  field,
  path,
  defaultValue = false,
  disabled = false,
  ...props
}: {
  label: ComponentProps<typeof FormControlLabel>["label"];
  size?: ComponentProps<typeof FormControlLabel>["size"];
  field: EncodingFieldType | null;
  path: string;
  defaultValue?: boolean;
  disabled?: boolean;
} & ComponentProps<typeof Switch>) => {
  const fieldProps = useChartOptionBooleanField({
    field,
    path,
    defaultValue,
  });

  return (
    <Switch
      disabled={disabled}
      label={label}
      size={size}
      {...fieldProps}
      {...props}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};
