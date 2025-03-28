import { ComponentProps } from "react";

import { ChartType } from "@/config-types";
import { IconName, Icons } from "@/icons/components";

export { Icons } from "./components";
export type { IconName } from "./components";

export const Icon = ({
  size = 24,
  color,
  name,
  ...props
}: {
  size?: number | string;
  color?: string;
  name: IconName;
} & ComponentProps<"svg">) => {
  const { style, ...otherProps } = props;
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn("No icon", name);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      color={color}
      style={{ minWidth: size, minHeight: size, ...style }}
      {...otherProps}
    />
  );
};

export const getChartIcon = (chartType: ChartType): IconName => {
  switch (chartType) {
    case "area":
      return "areasChart";
    case "column":
      return "chartColumn";
    case "bar":
      return "chartBar";
    case "line":
      return "lineChart";
    case "map":
      return "mapChart";
    case "pie":
      return "pieChart";
    case "scatterplot":
      return "scatterplotChart";
    case "table":
      return "tableChart";
    case "comboLineSingle":
      return "multilineChart";
    case "comboLineDual":
      return "dualAxisChart";
    case "comboLineColumn":
      return "columnLineChart";
    default:
      const _exhaustiveCheck: never = chartType;
      return _exhaustiveCheck;
  }
};
