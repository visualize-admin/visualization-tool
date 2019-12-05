import React from "react";
import {
  useChartTypeSelectorField,
  Option,
  useMultiFilterField,
  useMetaField,
  useSingleFilterField,
  useChartFieldField,
  useChartOptionField,
  useActiveFieldField
} from "../domain/config-form";
import { Radio, Checkbox, Select, Input } from "./form";
import { ChartTypeRadio } from "./chart-controls";
import { DataSetMetadata } from "../domain/data-cube";
import {
  MetaKey,
  ComponentWithMeta,
  FilterValueSingle,
  useConfiguratorState,
  DimensionWithMeta
} from "../domain";
import { Locales } from "../locales/locales";
import {
  ControlTab,
  FilterTab,
  AnnotatorTab
} from "./chart-controls/control-tab";
import { getFieldLabel } from "../domain/helpers";

export const ControlTabField = ({
  component,
  value,
  disabled
}: {
  component?: ComponentWithMeta;
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
  component: DimensionWithMeta;
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
  const filterValue = component.values.find(
    v => v.value.value === filterValueIri
  )!.label.value;
  return (
    <FilterTab
      component={component}
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
  label: string;
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
  disabled
}: {
  dimensionIri: string;
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useMultiFilterField({
    dimensionIri,
    value
  });

  return <Checkbox label={label} disabled={disabled} {...field}></Checkbox>;
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
  disabled,
  dataSetMetadata
}: {
  componentIri?: string;
  label: string | React.ReactNode;
  field: string;
  options: Option[];
  disabled?: boolean;
  dataSetMetadata: DataSetMetadata;
}) => {
  const fieldProps = useChartFieldField({
    componentIri,
    field,
    dataSetMetadata
  });

  return (
    <Select
      label={label}
      disabled={disabled}
      options={options}
      {...fieldProps}
    ></Select>
  );
};

export const ChartOptionField = ({
  label,
  field,
  path,
  value
}: {
  label: string;
  field: string;
  path: string;
  value: string;
}) => {
  const fieldProps = useChartOptionField({
    path,
    field,
    label,
    value
  });

  return <Radio label={getFieldLabel(label)} {...fieldProps}></Radio>;
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
  metaData: DataSetMetadata;
  disabled?: boolean;
}) => {
  const field = useChartTypeSelectorField({
    value,
    metaData
  });

  return (
    <ChartTypeRadio
      disabled={disabled}
      label={label}
      onClick={field.onClick}
      {...field}
    ></ChartTypeRadio>
  );
};
