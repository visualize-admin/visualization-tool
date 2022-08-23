import { t } from "@lingui/macro";
import { extent, timeFormat, TimeLocaleObject, timeParse } from "d3";
import get from "lodash/get";
import { ChangeEvent, ReactNode, useCallback, useMemo, useState } from "react";

import Flex from "@/components/flex";
import {
  Checkbox,
  DayPickerField,
  Input,
  Label,
  Radio,
  Select,
  Switch,
} from "@/components/form";
import { ColorPickerMenu } from "@/configurator/components/chart-controls/color-picker";
import {
  AnnotatorTab,
  ControlTab,
  OnOffControlTab,
} from "@/configurator/components/chart-controls/control-tab";
import {
  getPalette,
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
  useTimeFormatLocale,
} from "@/configurator/components/ui-helpers";
import {
  Option,
  OptionGroup,
  useActiveFieldField,
  useChartFieldField,
  useChartOptionRadioField,
  useMetaField,
  useSingleFilterField,
} from "@/configurator/config-form";
import {
  isMultiFilterFieldChecked,
  useChartOptionBooleanField,
  useChartOptionSelectField,
  useMultiFilterCheckboxes,
  useMultiFilterContext,
  useSingleFilterSelect,
} from "@/configurator/config-form";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { DimensionMetaDataFragment, TimeUnit } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { IconName } from "@/icons";
import truthy from "@/utils/truthy";

export const ControlTabField = ({
  component,
  value,
  disabled,
  labelId,
}: {
  component?: DimensionMetaDataFragment;
  value: string;
  disabled?: boolean;
  labelId: string;
}) => {
  const field = useActiveFieldField({
    value,
  });

  return (
    <ControlTab
      component={component}
      value={`${field.value}`}
      labelId={labelId}
      checked={field.checked}
      onClick={field.onClick}
    ></ControlTab>
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
  dimensionIri,
  label,
  options,
  id,
  disabled,
  isOptional,
  controls,
  optionGroups,
}: {
  dimensionIri: string;
  label: string;
  options: Option[];
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
  optionGroups?: [OptionGroup, Option[]][];
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });

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
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  return (
    <Select
      id={id}
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      options={allOptions}
      controls={controls}
      optionGroups={optionGroups}
      {...fieldProps}
    />
  );
};

const formatDate = timeFormat("%Y-%m-%d");
const parseDate = timeParse("%Y-%m-%d");

export const DataFilterSelectDay = ({
  dimensionIri,
  label,
  options,
  id,
  disabled,
  isOptional,
  controls,
}: {
  dimensionIri: string;
  label: string;
  options: Option[];
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });

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
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  const allOptionsSet = useMemo(() => {
    return new Set(
      allOptions
        .filter((x) => x.value !== FIELD_VALUE_NONE)
        .map((x) => {
          try {
            return x.value;
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
    <DayPickerField
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      controls={controls}
      onChange={fieldProps.onChange}
      name={dimensionIri}
      value={dateValue}
      isDayDisabled={isDisabled}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};

export const DataFilterSelectTime = ({
  dimensionIri,
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
  dimensionIri: string;
  label: string;
  from: string;
  to: string;
  timeUnit: TimeUnit;
  timeFormat: string;
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
  controls?: React.ReactNode;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });
  const formatLocale = useTimeFormatLocale();

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const fullLabel = isOptional ? `${label} (${optionalLabel})` : label;

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
      controls={controls}
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
  controls,
  isOptional,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  timeFormat: string;
  formatLocale: TimeLocaleObject;
  controls?: React.ReactNode;
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
    ></Input>
  );
};

export const AnnotatorTabField = ({
  value,
  ...tabProps
}: {
  value: string;
  disabled?: boolean;
  icon: IconName;
  label: ReactNode;
}) => {
  const fieldProps = useActiveFieldField({
    value,
  });

  return (
    <AnnotatorTab
      {...tabProps}
      value={`${fieldProps.value}`}
      checked={fieldProps.checked}
      onClick={fieldProps.onClick}
    ></AnnotatorTab>
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
  const [configuratorState, dispatch] = useConfiguratorState();
  const { dimensionIri, colorConfigPath } = useMultiFilterContext();
  const { activeField } = configuratorState;
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
  const chartConfig =
    configuratorState.state === "CONFIGURING_CHART"
      ? configuratorState.chartConfig
      : null;

  const color = chartConfig
    ? get(
        chartConfig,
        `fields["${activeField}"].${path}colorMapping["${value}"]`
      )
    : null;

  const palette = useMemo(() => {
    if (!chartConfig) {
      return [];
    }
    return getPalette(
      get(
        chartConfig,
        `fields["${activeField}"].${colorConfigPath ?? ""}.palette`
      )
    );
  }, [chartConfig, colorConfigPath, activeField]);

  const checkedState =
    configuratorState.state === "CONFIGURING_CHART" && dimensionIri
      ? isMultiFilterFieldChecked(
          configuratorState.chartConfig,
          dimensionIri,
          value
        )
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

export const MultiFilterFieldColorPicker = ({ value }: { value: string }) => {
  const { color, checked, palette, onChange } =
    useMultiFilterColorPicker(value);

  return color && checked ? (
    <ColorPickerMenu
      colors={palette}
      selectedColor={color}
      onChange={onChange}
    />
  ) : null;
};

export const MultiFilterFieldCheckbox = ({
  label,
  value,
  disabled,
  onChange: onChangeProp,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: () => void;
}) => {
  const [state] = useConfiguratorState();
  const {
    onChange: onFieldChange,
    checked,
    indeterminate,
    dimensionIri,
  } = useMultiFilterCheckboxes(value, onChangeProp);

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  return (
    <Checkbox
      name={dimensionIri}
      value={value}
      label={label}
      disabled={disabled}
      onChange={onFieldChange}
      checked={checked}
      indeterminate={indeterminate}
    />
  );
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

  return <Radio label={label} disabled={disabled} {...field}></Radio>;
};

export const ColorPickerField = ({
  field,
  path,
  label,
  disabled,
}: {
  field: string;
  path: string;
  label: ReactNode;
  disabled?: boolean;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const updateColor = useCallback(
    (value: string) =>
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value,
        },
      }),
    [dispatch, field, path]
  );

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  const color = get(state, `chartConfig.fields["${field}"].${path}`);

  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        height: "2rem",
        width: "100%",
      }}
    >
      <Label htmlFor="xyz">{label}</Label>
      <ColorPickerMenu
        colors={getPalette()}
        selectedColor={color}
        onChange={(c) => updateColor(c)}
        disabled={disabled}
      />
    </Flex>
  );
};

export const ChartFieldField = ({
  componentIri,
  label,
  field,
  options,
  optional,
  disabled,
  dataSetMetadata,
}: {
  componentIri?: string;
  label: string;
  field: string;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
  dataSetMetadata: DataCubeMetadata;
}) => {
  const fieldProps = useChartFieldField({
    field,
    dataSetMetadata,
  });

  const noneLabel = t({
    id: "controls.dimension.none",
    message: `No dimension selected`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={optional ? `${label} (${optionalLabel})` : label}
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
      {...fieldProps}
    ></Select>
  );
};

export const ChartOptionRadioField = ({
  label,
  field,
  path,
  value,
  defaultChecked,
  disabled = false,
}: {
  label: string;
  field: string | null;
  path: string;
  value: string;
  defaultChecked?: boolean;
  disabled?: boolean;
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
    ></Radio>
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
  field: string | null;
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
    ></Checkbox>
  );
};

export const ChartOptionSelectField = <ValueType extends {} = string>({
  id,
  label,
  field,
  path,
  disabled = false,
  options,
  getValue,
  getKey,
}: {
  id: string;
  label: string | ReactNode;
  field: string;
  path: string;
  disabled?: boolean;
  options: Option[];
  getValue?: (x: string) => ValueType | undefined;
  getKey?: (x: ValueType) => string;
}) => {
  const fieldProps = useChartOptionSelectField({
    field,
    path,
    getValue,
    getKey,
  });

  return (
    <Select
      id={id}
      disabled={disabled}
      label={label}
      options={options}
      {...fieldProps}
    ></Select>
  );
};

export const ChartOptionSwitchField = ({
  label,
  field,
  path,
  defaultValue = false,
  disabled = false,
}: {
  label: string;
  field: string | null;
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
    ></Switch>
  );
};

export const OnOffTabField = () => {};
