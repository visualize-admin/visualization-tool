import { Checkbox, Input, Label, Radio } from "@rebass/forms";
import React from "react";
import {
  useDatasetSelectorField,
  useField,
  useChartTypeSelectorField
} from "../domain/config-form";
import { DataCube } from "@zazuko/query-rdf-data-cube";
import { useDataSetAndMetadata } from "../domain";

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
    <Label>
      <Radio {...field} disabled={disabled}></Radio>
      {label}
    </Label>
  ) : type === "checkbox" ? (
    <Label>
      <Checkbox {...field} disabled={disabled}></Checkbox>
      {label}
    </Label>
  ) : (
    <>
      <Label>{label}</Label>
      <Input {...field} disabled={disabled}></Input>
    </>
  );
};

export const DatasetSelectorField = ({
  chartId,
  label,
  path,
  type,
  value,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value: string;
}) => {
  const field = useDatasetSelectorField({
    chartId,
    path,
    type: "radio",
    value
  });

  return (
    <Label>
      <Radio {...field}></Radio>
      {label}
    </Label>
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

  return (
    <Label>
      <Radio {...field}></Radio>
      {label}
    </Label>
  );
};
