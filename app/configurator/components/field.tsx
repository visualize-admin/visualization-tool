import { t, Trans } from "@lingui/macro";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Switch as MUISwitch,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TimeLocaleObject } from "d3-time-format";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import pick from "lodash/pick";
import React, {
  ChangeEvent,
  ComponentProps,
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
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import SelectTree from "@/components/select-tree";
import useDisclosure from "@/components/use-disclosure";
import {
  ChartConfig,
  getChartConfig,
  useChartConfigFilters,
} from "@/config-types";
import { ColorPickerMenu } from "@/configurator/components/chart-controls/color-picker";
import {
  AnnotatorTab,
  AnnotatorTabProps,
  ControlTab,
  OnOffControlTab,
} from "@/configurator/components/chart-controls/control-tab";
import {
  DatePickerField,
  DatePickerTimeUnit,
} from "@/configurator/components/field-date-picker";
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
import { useLocale } from "@/locales/use-locale";
import { getPalette } from "@/palettes";
import { hierarchyToOptions } from "@/utils/hierarchy";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    gap: "0.25rem",
    textAlign: "left",
    paddingRight: theme.spacing(1),
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: "0.75rem",
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
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
  fieldComponents?: Component[];
  value: string;
  labelId: string | null;
  disabled?: boolean;
  warnMessage?: string;
};

export const ControlTabField = (props: ControlTabFieldProps) => {
  const {
    chartConfig,
    fieldComponents,
    value,
    labelId,
    disabled,
    warnMessage,
  } = props;
  const field = useActiveChartField({ value });

  return (
    <ControlTab
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
  isOptional,
  topControls,
  sideControls,
  hierarchy,
  onOpen,
  loading,
}: {
  dimension: Dimension;
  label: React.ReactNode;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  topControls?: React.ReactNode;
  sideControls?: React.ReactNode;
  hierarchy?: HierarchyValue[] | null;
  onOpen?: () => void;
  loading?: boolean;
}) => {
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
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
        topControls={topControls}
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
    <div>
      {canUseMostRecentValue ? (
        <MostRecentDateSwitch
          label={label}
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
      ) : (
        <FieldLabel label={label} isOptional={isOptional} />
      )}
      <Select
        id={id}
        disabled={disabled || usesMostRecentValue}
        options={allValues}
        sortOptions={false}
        topControls={topControls}
        sideControls={sideControls}
        open={isOpen}
        onClose={handleClose}
        onOpen={handleOpen}
        loading={loading}
        {...fieldProps}
        value={usesMostRecentValue ? maxValue : fieldProps.value}
      />
    </div>
  );
};

type MostRecentDateSwitchProps = {
  label?: React.ReactNode;
  checked: boolean;
  onChange: () => void;
  noGutter?: boolean;
};

export const MostRecentDateSwitch = (props: MostRecentDateSwitchProps) => {
  const { label, checked, onChange, noGutter } = props;
  return (
    <Box sx={{ mt: noGutter ? 0 : "0.75rem" }}>
      {label && <FieldLabel label={label} />}
      <FormGroup>
        <FormControlLabel
          control={<MUISwitch checked={checked} onChange={onChange} />}
          label={
            <Typography variant="body2">
              <Trans id="controls.filter.use-most-recent">
                Use most recent
              </Trans>
            </Typography>
          }
          sx={{ mr: 0 }}
        />
      </FormGroup>
    </Box>
  );
};

export const dimensionToFieldProps = (dim: Component) => {
  return isJoinByComponent(dim)
    ? dim.originalIris.map((o) => pick(o, ["cubeIri", "dimensionIri"]))
    : [
        {
          dimensionIri: dim.iri,
          cubeIri: dim.cubeIri,
        },
      ];
};

export const DataFilterTemporal = ({
  label: _label,
  dimension,
  timeUnit,
  disabled,
  isOptional,
  topControls,
  sideControls,
}: {
  label: React.ReactNode;
  dimension: TemporalDimension;
  timeUnit: DatePickerTimeUnit;
  disabled?: boolean;
  isOptional?: boolean;
  topControls?: React.ReactNode;
  sideControls?: React.ReactNode;
}) => {
  const { values, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
  const usesMostRecentDate = isMostRecentValue(fieldProps.value);
  const label = isOptional ? (
    <>
      {_label}{" "}
      <span style={{ marginLeft: "0.25rem" }}>
        (<Trans id="controls.select.optional">optional</Trans>)
      </span>
    </>
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
        name={`date-picker-${dimension.iri}`}
        label={
          <FieldLabel
            label={
              <OpenMetadataPanelWrapper component={dimension}>
                {label}
              </OpenMetadataPanelWrapper>
            }
          />
        }
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
        topControls={topControls}
        sideControls={sideControls}
        parseDate={parseDate}
      />
      <MostRecentDateSwitch
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
  isOptional,
  topControls,
}: {
  dimension: Dimension;
  label: React.ReactNode;
  from: string;
  to: string;
  timeUnit: TimeUnit;
  timeFormat: string;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  topControls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect(dimensionToFieldProps(dimension));
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
        topControls={topControls}
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

type AnnotatorTabFieldProps<T extends string = string> = {
  value: T;
  emptyValueWarning?: React.ReactNode;
} & Omit<AnnotatorTabProps, "onClick" | "value">;

export const ChartAnnotatorTabField = (props: AnnotatorTabFieldProps) => {
  const { value, emptyValueWarning, ...tabProps } = props;
  const fieldProps = useActiveChartField({ value });
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const locale = useLocale();

  return (
    <AnnotatorTab
      {...tabProps}
      lowerLabel={
        (chartConfig.meta as any)[value]?.[locale] ? null : (
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

export const LayoutAnnotatorTabField = (
  props: AnnotatorTabFieldProps<"title" | "description" | "label">
) => {
  const { value, emptyValueWarning, ...tabProps } = props;
  const fieldProps = useActiveLayoutField({ value });
  const [state] = useConfiguratorState(isLayouting);
  const locale = useLocale();

  return (
    <AnnotatorTab
      {...tabProps}
      lowerLabel={
        state.layout.meta[value][locale] ? null : (
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
  type,
  label,
  metaKey,
  locale,
  value,
  disabled,
}: {
  type: "chart" | "layout";
  label: string | ReactNode;
  metaKey: string;
  locale: string;
  value?: string;
  disabled?: boolean;
}) => {
  const field = useMetaField({ type, metaKey, locale, value });
  return <Input label={label} {...field} disabled={disabled} />;
};

const useMultiFilterColorPicker = (value: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);
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
    ? isMultiFilterFieldChecked(filters, dimensionIri, value)
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
  filters,
  label,
  value,
  disabled,
}: {
  filters: { cubeIri: string; dimensionIri: string }[];
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({ filters, value });
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

  return <CircularProgress size={16} className={classes.loadingIndicator} />;
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
  components,
}: {
  label?: string;
  field: EncodingFieldType;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
  components: Component[];
}) => {
  const props = useChartFieldField({ field, components });
  const noneLabel = t({
    id: "controls.none",
    message: "None",
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={<FieldLabel isOptional={optional} label={label} />}
      disabled={disabled}
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
      {...props}
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
  ...props
}: {
  label: React.ComponentProps<typeof FormControlLabel>["label"];
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
      {...fieldProps}
      {...props}
      checked={fieldProps.checked ?? defaultValue}
    />
  );
};
