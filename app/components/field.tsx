import React, { ChangeEvent, useCallback } from "react";
import { FilterValueSingle, MetaKey, useConfiguratorState } from "../domain";
import {
  FIELD_VALUE_NONE,
  Option,
  useActiveFieldField,
  useChartFieldField,
  useChartOptionField,
  useChartTypeSelectorField,
  useMetaField,
  useSingleFilterField
} from "../domain/config-form";
import { getFieldLabel } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  DimensionFieldsWithValuesFragment
} from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { Locales } from "../locales/locales";
import { ChartTypeSelectionButton } from "./chart-controls";
import {
  AnnotatorTab,
  ControlTab,
  FilterTab
} from "./chart-controls/control-tab";
import { Checkbox, Input, Radio, Select } from "./form";

export const ControlTabField = ({
  component,
  value,
  disabled
}: {
  component?: ComponentFieldsFragment;
  value: string;
  disabled?: boolean;
}) => {
  const field = useActiveFieldField({
    value
  });

  return (
    <ControlTab
      component={component}
      value={`${field.value}`}
      checked={field.checked}
      disabled={disabled}
      onClick={field.onClick}
    ></ControlTab>
  );
};

export const FilterTabField = ({
  component,
  value,
  disabled
}: {
  component: DimensionFieldsWithValuesFragment;
  value: string;
  disabled?: boolean;
}) => {
  const field = useActiveFieldField({
    value
  });
  const [state] = useConfiguratorState();

  const filterValueIri =
    state.state === "CONFIGURING_CHART" &&
    state.chartConfig.filters[value].type === "single"
      ? (state.chartConfig.filters[value] as FilterValueSingle).value
      : "";
  const filterValue = component.values.find(v => v.value === filterValueIri)!
    .label;
  return (
    <FilterTab
      label={component.label}
      value={`${field.value}`}
      checked={field.checked}
      disabled={disabled}
      onClick={field.onClick}
      filterValue={filterValue}
    ></FilterTab>
  );
};

export const AnnotatorTabField = ({
  value,
  disabled
}: {
  value: string;
  disabled?: boolean;
}) => {
  const field = useActiveFieldField({
    value
  });

  return (
    <AnnotatorTab
      value={`${field.value}`}
      checked={field.checked}
      disabled={disabled}
      onClick={field.onClick}
    ></AnnotatorTab>
  );
};

export const MetaInputField = ({
  label,
  metaKey,
  locale,
  value,
  disabled,
  ...props
}: {
  label: string | React.ReactNode;
  metaKey: string;
  locale: Locales;
  value?: string;
  disabled?: boolean;
}) => {
  const field = useMetaField({
    metaKey,
    locale,
    value
  });

  return <Input label={label} {...field} disabled={disabled}></Input>;
};

export const MetaTextarea = ({
  label,
  metaKey,
  locale,
  value,
  disabled,
  ...props
}: {
  label: string;
  metaKey: MetaKey;
  locale: Locales;
  value?: string;
  disabled?: boolean;
}) => {
  const field = useMetaField({
    metaKey,
    locale,
    value
  });

  return <Input label={label} {...field} disabled={disabled}></Input>;
};

export const MultiFilterField = ({
  dimensionIri,
  label,
  value,
  disabled,
  allValues,
  checked,
  onChange,
  checkAction
}: {
  dimensionIri: string;
  label: string;
  value: string;
  allValues: string[];
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  checkAction: "ADD" | "SET";
}) => {
  const [state, dispatch] = useConfiguratorState();

  const onFieldChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      if (e.currentTarget.checked) {
        dispatch({
          type:
            checkAction === "ADD"
              ? "CHART_CONFIG_FILTER_ADD_MULTI"
              : "CHART_CONFIG_FILTER_SET_MULTI",
          value: {
            dimensionIri,
            value,
            allValues
          }
        });
      } else {
        dispatch({
          type: "CHART_CONFIG_FILTER_REMOVE_MULTI",
          value: {
            dimensionIri,
            value,
            allValues
          }
        });
      }
      // Call onChange prop
      onChange?.();
    },
    [dispatch, dimensionIri, allValues, value, onChange, checkAction]
  );

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  const filter = state.chartConfig.filters[dimensionIri];
  const fieldChecked =
    filter?.type === "multi" ? filter.values?.[value] ?? false : false;

  return (
    <Checkbox
      name={dimensionIri}
      value={value}
      label={label}
      disabled={disabled}
      onChange={onFieldChange}
      checked={checked ?? fieldChecked}
    ></Checkbox>
  );
};
export const SingleFilterField = ({
  dimensionIri,
  label,
  value,
  disabled
}: {
  dimensionIri: string;
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({
    dimensionIri,
    value
  });

  return <Radio label={label} disabled={disabled} {...field}></Radio>;
};

export const ChartFieldField = ({
  componentIri,
  label,
  field,
  options,
  optional,
  disabled,
  dataSetMetadata
}: {
  componentIri?: string;
  label: string | React.ReactNode;
  field: string;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
  dataSetMetadata: DataCubeMetadata;
}) => {
  const fieldProps = useChartFieldField({
    componentIri,
    field,
    dataSetMetadata
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={label}
      disabled={disabled}
      options={
        optional
          ? [{ value: FIELD_VALUE_NONE, label: "None" }, ...options]
          : options
      }
      {...fieldProps}
    ></Select>
  );
};

export const ChartOptionField = ({
  label,
  field,
  path,
  value,
  disabled = false
}: {
  label: string;
  field: string;
  path: string;
  value: string;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionField({
    path,
    field,
    label,
    value
  });

  return (
    <Radio
      disabled={disabled}
      label={getFieldLabel(label)}
      {...fieldProps}
    ></Radio>
  );
};

export const ChartTypeSelectorField = ({
  label,
  value,
  metaData,
  disabled,
  ...props
}: {
  label: string;
  value: string;
  metaData: DataCubeMetadata;
  disabled?: boolean;
}) => {
  const field = useChartTypeSelectorField({
    value,
    metaData
  });

  return (
    <ChartTypeSelectionButton
      disabled={disabled}
      label={label}
      onClick={field.onClick}
      {...field}
    ></ChartTypeSelectionButton>
  );
};
