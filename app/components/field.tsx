import { Input, Label } from "@rebass/forms";
import React from "react";
import { useChartTypeSelectorField, useField } from "../domain/config-form";
import { Radio, Checkbox } from "./form";

export const Field = ({
  chartId,
  label,
  path,
  type,
  value,
  disabled,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value?: string;
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
    <Checkbox label={label} {...field} disabled={false}></Checkbox>
  ) : (
    <>
      <Label>{label}</Label>
      <Input {...field} disabled={disabled}></Input>
    </>
  );
};

export const ChartTypeSelectorField = ({
  chartId,
  label,
  path,
  type,
  value,
  meta,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value: string;
  meta: any;
}) => {
  const field = useChartTypeSelectorField({
    chartId,
    path,
    type: "radio",
    value,
    metaData: meta.data
  });

  return <Radio label={label} {...field}></Radio>;
};
