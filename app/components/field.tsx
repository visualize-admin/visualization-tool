import React from "react";
import {
  useChartTypeSelectorField,
  useField,
  Option,
  useMultiFilterField,
  useMetaField
} from "../domain/config-form";
import { Radio, Checkbox, Select, Input } from "./form";
import { ChartTypeRadio } from "./chart-controls";
import { DataSetMetadata } from "../domain/data-cube";
import { MetaKey } from "../domain";
import { Locales } from "../locales/locales";

export const Field = ({
  chartId,
  label,
  path,
  type,
  value,
  options,
  disabled,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio" | "input" | "select";
  value?: string;
  options?: Option[];
  disabled?: boolean;
}) => {
  const field = useField({
    path,
    type,
    value
  });

  return type === "radio" ? (
    <Radio label={label} disabled={disabled} {...field}></Radio>
  ) : type === "checkbox" ? (
    <Checkbox label={label} disabled={disabled} {...field}></Checkbox>
  ) : type === "input" ? (
    <Input label={label} {...field} disabled={disabled}></Input>
  ) : (
    <Select options={options!} label={label} {...field}></Select> // FIXME: make sure options is defined
  );
};
export const MetaInputField = ({
  chartId,
  label,
  metaKey,
  locale,
  value,
  disabled,
  ...props
}: {
  chartId: string;
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
export const MetaTextarea = ({
  chartId,
  label,
  metaKey,
  locale,
  value,
  disabled,
  ...props
}: {
  chartId: string;
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

export const ChartTypeSelectorField = ({
  chartId,
  label,
  path,
  type,
  value,
  metaData,
  disabled,

  ...props
}: {
  chartId: string;
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
