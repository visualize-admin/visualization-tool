import React from "react";
import {
  useChartTypeSelectorField,
  Option,
  useMultiFilterField,
  useMetaField,
  useControlTab,
  useSingleFilterField,
  useChartFieldField,
  useChartOptionField,
  useFilterTab,
  useAnnotatorTab
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
import { IconName } from "../icons";

// export const Field = ({
//   label,
//   path,
//   type,
//   value,
//   options,
//   disabled,
//   ...props
// }: {
//   label: string;
//   path: string;
//   type?: "text" | "checkbox" | "radio" | "input" | "select";
//   value?: string;
//   options?: Option[];
//   disabled?: boolean;
// }) => {
//   const field = useField({
//     path,
//     type,
//     value
//   });

//   return type === "radio" ? (
//     <Radio label={label} disabled={disabled} {...field}></Radio>
//   ) : type === "checkbox" ? (
//     <Checkbox label={label} disabled={disabled} {...field}></Checkbox>
//   ) : type === "input" ? (
//     <Input label={label} {...field} disabled={disabled}></Input>
//   ) : (
//     <Select options={options!} label={label} {...field}></Select> // FIXME: make sure options is defined
//   );
// };
export const ControlTabField = ({
  iconName,
  component,
  value,
  disabled
}: {
  iconName: IconName;
  component?: ComponentWithMeta;
  value: string;
  disabled?: boolean;
}) => {
  const field = useControlTab({
    value
  });

  return (
    <ControlTab
      iconName={iconName}
      component={component}
      value={field.value}
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
  const field = useFilterTab({
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
      value={field.value}
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
  const field = useAnnotatorTab({
    value
  });

  return (
    <AnnotatorTab
      value={field.value}
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

  return <Radio label={label} {...fieldProps}></Radio>;
};

export const ChartTypeSelectorField = ({
  label,
  path,
  type,
  value,
  metaData,
  disabled,

  ...props
}: {
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value: string;
  metaData: DataSetMetadata;
  disabled?: boolean;
}) => {
  const field = useChartTypeSelectorField({
    path,
    value,
    metaData
  });

  return (
    <ChartTypeRadio
      disabled={disabled}
      label={label}
      {...field}
    ></ChartTypeRadio>
  );
};
