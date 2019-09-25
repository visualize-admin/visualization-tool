import { Checkbox, Input, Label, Radio } from "@rebass/forms";
import React from "react";
import { useField } from "../domain/config-form";

export const Field = ({
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
  value?: string;
}) => {
  const field = useField({
    chartId,
    path,
    type,
    value
  });

  return type === "radio" ? (
    <Label>
      <Radio {...field}></Radio>
      {label}
    </Label>
  ) : type === "checkbox" ? (
    <Label>
      <Checkbox {...field}></Checkbox>
      {label}
    </Label>
  ) : (
    <>
      <Label>{label}</Label>
      <Input {...field}></Input>
    </>
  );
};
