import { getLabelWithUnit } from "@/charts/shared/chart-helpers";
import { Component, isNumericalMeasure, Observation } from "@/domain/data";
import { getTextWidth } from "@/utils/get-text-width";

const MIN_COLUMN_WIDTH = 50;
const HEADER_PADDING = 44;
const CELL_PADDING = 20;
const FONT_SIZE = 16;

export const getNaturalColumnWidth = ({
  component,
  observations,
  formatNumber,
}: {
  component: Component;
  observations: Observation[];
  formatNumber: (value: number) => string;
}) => {
  const isNumber = isNumericalMeasure(component);
  const values = new Set<Observation[string]>();

  for (const observation of observations) {
    values.add(observation[component.id]);
  }

  let width = Math.max(
    MIN_COLUMN_WIDTH,
    measureText(getLabelWithUnit(component)) + HEADER_PADDING
  );

  for (const value of values) {
    const text = isNumber ? formatNumber(value as number) : `${value}`;
    width = Math.max(width, measureText(text) + CELL_PADDING);
  }

  return width;
};

const measureText = (text: string) => {
  return getTextWidth(text, { fontSize: FONT_SIZE });
};
