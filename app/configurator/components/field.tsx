import { t } from "@lingui/macro";
import {
  CircularProgress,
  FormControlLabel,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TimeLocaleObject, extent, timeFormat, timeParse } from "d3";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { LegendItem, LegendSymbol } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import {
  Checkbox,
  Input,
  Radio,
  Select,
  Slider,
  Switch,
} from "@/components/form";
import SelectTree from "@/components/select-tree";
import useDisclosure from "@/components/use-disclosure";
import { ChartConfig, getChartConfig } from "@/config-types";
import { ColorPickerMenu } from "@/configurator/components/chart-controls/color-picker";
import {
  AnnotatorTab,
  AnnotatorTabProps,
  ControlTab,
  OnOffControlTab,
} from "@/configurator/components/chart-controls/control-tab";
import { DatePickerField } from "@/configurator/components/field-date-picker";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import {
  Option,
  isMultiFilterFieldChecked,
  useActiveFieldField,
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
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { truthy } from "@/domain/types";
import { useTimeFormatLocale } from "@/formatters";
import { DimensionMetadataFragment, TimeUnit } from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { getPalette } from "@/palettes";
import { hierarchyToOptions } from "@/utils/hierarchy";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    gap: "0.25rem",
  },
  loadingIndicator: {
    color: theme.palette.grey[700],
    display: "inline-block",
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
}));

type ControlTabFieldProps = {
  chartConfig: ChartConfig;
  component?: DimensionMetadataFragment;
  value: string;
  labelId: string | null;
  disabled?: boolean;
  warnMessage?: string;
};

export const ControlTabField = (props: ControlTabFieldProps) => {
  const { chartConfig, component, value, labelId, disabled, warnMessage } =
    props;
  const field = useActiveFieldField({ value });

  return (
    <ControlTab
      chartConfig={chartConfig}
      component={component}
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
  const { checked, onClick } = useActiveFieldField({
    value,
  });

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
  isOptional,
  controls,
  hierarchy,
  onOpen,
  loading,
}: {
  dimension: DimensionMetadataFragment;
  label: React.ReactNode;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
  hierarchy?: HierarchyValue[];
  onOpen?: () => void;
  loading?: boolean;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri: dimension.iri });

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(dimension);

    return orderBy(
      dimension.values,
      sorters.map((s) => (dv) => s(dv.label))
    );
  }, [dimension]);

  const allValues = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...sortedValues,
        ]
      : sortedValues;
  }, [isOptional, sortedValues, noneLabel]);

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
  const handleOpen = () => {
    open();
    onOpen?.();
  };

  const handleClose = () => {
    close();
  };

  if (hierarchy && hierarchyOptions) {
    return (
      <SelectTree
        label={<FieldLabel label={label} isOptional={isOptional} />}
        id={id}
        options={hierarchyOptions}
        onClose={handleClose}
        onOpen={handleOpen}
        open={isOpen}
        disabled={disabled}
        controls={controls}
        {...fieldProps}
      />
    );
  }

  return (
    <Select
      id={id}
      label={<FieldLabel label={label} isOptional={isOptional} />}
      disabled={disabled}
      options={allValues}
      sortOptions={false}
      controls={controls}
      open={isOpen}
      onClose={handleClose}
      onOpen={handleOpen}
      loading={loading}
      {...fieldProps}
    />
  );
};

const formatDate = timeFormat("%Y-%m-%d");
const parseDate = timeParse("%Y-%m-%d");

export const DataFilterSelectDay = ({
  dimension,
  label,
  disabled,
  isOptional,
  controls,
}: {
  dimension: DimensionMetadataFragment;
  label: React.ReactNode;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri: dimension.iri });

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...dimension.values,
        ]
      : dimension.values;
  }, [isOptional, dimension.values, noneLabel]);

  const allOptionsSet = useMemo(() => {
    return new Set(
      allOptions
        .filter((x) => x.value !== FIELD_VALUE_NONE)
        .map((x) => {
          try {
            return x.value as string;
          } catch (e) {
            console.warn(`Bad value ${x.value}`);
            return;
          }
        })
        .filter(truthy)
    );
  }, [allOptions]);

  const isDisabled = useCallback(
    (date: Date) => {
      return !allOptionsSet.has(formatDate(date));
    },
    [allOptionsSet]
  );

  const dateValue = useMemo(() => {
    const parsed = fieldProps.value ? parseDate(fieldProps.value) : undefined;
    return parsed || new Date();
  }, [fieldProps.value]);

  const [minDate, maxDate] = useMemo(() => {
    const [min, max] = extent(Array.from(allOptionsSet));
    if (!min || !max) {
      return [];
    }
    return [new Date(min), new Date(max)] as const;
  }, [allOptionsSet]);

  return (
    <DatePickerField
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      controls={controls}
      onChange={fieldProps.onChange}
      name={dimension.iri}
      value={dateValue}
      isDateDisabled={isDisabled}
      minDate={minDate}
      maxDate={maxDate}
    />
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
  isOptional,
  controls,
}: {
  dimension: DimensionMetadataFragment;
  label: React.ReactNode;
  from: string;
  to: string;
  timeUnit: TimeUnit;
  timeFormat: string;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri: dimension.iri });
  const formatLocale = useTimeFormatLocale();

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const fullLabel = isOptional ? (
    <>
      {label} <div style={{ marginLeft: "0.25rem" }}>({optionalLabel})</div>
    </>
  ) : (
    label
  );

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

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  if (options.length) {
    return (
      <Select
        id={id}
        label={fullLabel}
        disabled={disabled}
        options={allOptions}
        sortOptions={false}
        controls={controls}
        {...fieldProps}
      />
    );
  }

  return (
    <TimeInput
      id={id}
      label={fullLabel}
      value={fieldProps.value}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={isOptional}
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
  label: React.ReactNode;
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

export const AnnotatorTabField = ({
  value,
  emptyValueWarning,
  ...tabProps
}: {
  value: string;
  emptyValueWarning?: React.ReactNode;
} & Omit<AnnotatorTabProps, "onClick">) => {
  const fieldProps = useActiveFieldField({
    value,
  });

  const [state] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const hasText = useMemo(() => {
    const key = value as "title" | "description";
    return state.meta[key]?.[locale] !== "";
  }, [state.meta, value, locale]);

  return (
    <AnnotatorTab
      {...tabProps}
      lowerLabel={
        hasText ? null : (
          <Typography variant="caption" color="warning.main">
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
  label,
  metaKey,
  locale,
  value,
  disabled,
}: {
  label: string | ReactNode;
  metaKey: string;
  locale: string;
  value?: string;
  disabled?: boolean;
}) => {
  const field = useMetaField({
    metaKey,
    locale,
    value,
  });

  return <Input label={label} {...field} disabled={disabled} />;
};

const useMultiFilterColorPicker = (value: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const { dimensionIri, colorConfigPath } = useMultiFilterContext();
  const { activeField } = chartConfig;
  const onChange = useCallback(
    (color: string) => {
      if (activeField) {
        dispatch({
          type: "CHART_COLOR_CHANGED",
          value: {
            field: activeField,
            colorConfigPath,
            color,
            value,
          },
        });
      }
    },

    [colorConfigPath, dispatch, activeField, value]
  );

  const path = colorConfigPath ? `${colorConfigPath}.` : "";
  const color = get(
    chartConfig,
    `fields["${activeField}"].${path}colorMapping["${value}"]`
  );

  const palette = useMemo(() => {
    return getPalette(
      get(
        chartConfig,
        `fields["${activeField}"].${
          colorConfigPath ? `${colorConfigPath}.` : ""
        }palette`
      )
    );
  }, [chartConfig, colorConfigPath, activeField]);

  const checkedState = dimensionIri
    ? isMultiFilterFieldChecked(chartConfig, dimensionIri, value)
    : null;

  return useMemo(
    () => ({
      color,
      palette,
      onChange,
      checked: checkedState,
    }),
    [color, palette, onChange, checkedState]
  );
};

export const MultiFilterFieldColorPicker = ({
  value,
  label,
  symbol,
}: {
  value: string;
  label: string;
  symbol: LegendSymbol;
}) => {
  const { color, checked, palette, onChange } =
    useMultiFilterColorPicker(value);

  return color && checked ? (
    <Flex
      sx={{
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <LegendItem
        symbol={symbol}
        item={label}
        color={color}
        usage="colorPicker"
      />
      <ColorPickerMenu
        colors={palette}
        selectedColor={color}
        onChange={onChange}
      />
    </Flex>
  ) : null;
};

export const SingleFilterField = ({
  dimensionIri,
  label,
  value,
  disabled,
}: {
  dimensionIri: string;
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({
    dimensionIri,
    value,
  });

  return <Radio label={label} disabled={disabled} {...field} />;
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
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field,
          path,
          value,
        },
      }),
    [locale, dispatch, field, path]
  );

  const color = get(chartConfig, `fields["${field}"].${path}`);
  const palette = getPalette(get(chartConfig, `fields["${field}"].palette`));

  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <LegendItem
        item={label}
        color={color}
        symbol={symbol}
        usage="colorPicker"
      />
      <ColorPickerMenu
        colors={palette}
        selectedColor={color}
        onChange={updateColor}
        disabled={disabled}
      />
    </Flex>
  );
};

export const LoadingIndicator = () => {
  const classes = useStyles();

  return <CircularProgress size={12} className={classes.loadingIndicator} />;
};

export const FieldLabel = ({
  label,
  isOptional,
  isFetching,
}: {
  label: React.ReactNode;
  isOptional?: boolean;
  isFetching?: boolean;
}) => {
  const classes = useStyles();
  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  return (
    <div className={classes.root}>
      {label}
      {isOptional ? <span>({optionalLabel})</span> : null}
      {isFetching ? <LoadingIndicator /> : null}
    </div>
  );
};

export const ChartFieldField = ({
  label = "",
  field,
  options,
  optional,
  disabled,
}: {
  label?: string;
  field: EncodingFieldType;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
}) => {
  const { fetching, ...fieldProps } = useChartFieldField({ field });
  const noneLabel = t({
    id: "controls.none",
    message: "None",
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={
        <FieldLabel isOptional={optional} isFetching={fetching} label={label} />
      }
      disabled={disabled || fetching}
      options={
        optional
          ? [
              {
                value: FIELD_VALUE_NONE,
                label: noneLabel,
                isNoneValue: true,
              },
              ...options,
            ]
          : options
      }
      {...fieldProps}
    />
  );
};

type ChartOptionRadioFieldProps<V extends string | number> = {
  label: string;
  field: EncodingFieldType | null;
  path: string;
  value: V;
  defaultChecked?: boolean;
  disabled?: boolean;
  warnMessage?: string;
};

export const ChartOptionRadioField = <V extends string | number>(
  props: ChartOptionRadioFieldProps<V>
) => {
  const {
    label,
    field,
    path,
    value,
    defaultChecked,
    disabled = false,
    warnMessage,
  } = props;
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
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: string;
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
  getValue?: (x: string) => V | undefined;
  getKey?: (x: V) => string;
  isOptional?: boolean;
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
    getValue,
    getKey,
    isOptional,
  } = props;
  const fieldProps = useChartOptionSelectField({
    field,
    path,
    getValue,
    getKey,
  });
  const noneLabel = t({
    id: "controls.none",
    message: "None",
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  return (
    <Select
      id={id}
      disabled={disabled}
      label={
        <FieldLabel isOptional={isOptional} isFetching={false} label={label} />
      }
      options={allOptions}
      {...fieldProps}
    />
  );
};

export const ChartOptionSwitchField = ({
  label,
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: React.ComponentProps<typeof FormControlLabel>["label"];
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
    <Switch
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};
