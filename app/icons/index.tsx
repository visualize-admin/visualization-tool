import { ComponentProps } from "react";
import { ChartType } from "../configurator";
import { IconName, Icons } from "./components";

export { Icons } from "./components";
export type { IconName } from "./components";

export const Icon = ({
  size = 24,
  color,
  name,
  ...props
}: {
  size?: number;
  color?: string;
  name: IconName;
} & ComponentProps<"svg">) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn("No icon", name);
    return null;
  }

  return <IconComponent width={size} height={size} color={color} {...props} />;
};

export const getChartIcon = (chartType: ChartType): IconName => {
  switch (chartType) {
    case "area":
      return "chartArea";
    case "bar":
      return "chartBar";
    case "column":
      return "chartColumn";
    case "line":
      return "chartLine";
    case "map":
      return "chartMap";
    case "pie":
      return "chartPie";
    case "scatterplot":
      return "chartScatterplot";
    case "table":
      return "table";
  }
};
