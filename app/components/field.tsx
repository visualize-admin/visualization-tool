import React from "react";
import {
  useChartTypeSelectorField,
  useField,
  Option
} from "../domain/config-form";
import { Radio, Checkbox, Select, Input } from "./form";
import { ChartTypeRadio } from "./chart-controls";
import { DataSetMetadata } from "../domain/data-cube";

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
    chartId,
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

export const ChartTypeSelectorField = ({
  chartId,
  label,
  path,
  type,
  value,
  metaData,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value: string;
  metaData: DataSetMetadata;
}) => {
  const field = useChartTypeSelectorField({
    chartId,
    path,
    type: "radio",
    value,
    metaData
  });

  return <ChartTypeRadio label={label} {...field}></ChartTypeRadio>;
};
