import * as React from "react";
import { IconCheck } from "./ic-check";
import { IconAdd } from "./ic-add";
import { IconSearch } from "./ic-search";
import { IconBarChart } from "./ic-bar-chart";
import { IconColumnChart } from "./ic-column-chart";
import { IconLineChart } from "./ic-line-chart";
import { IconAreaChart } from "./ic-area-chart";
import { IconScatterplot } from "./ic-scatterplot";

export const Icons = {
         check: IconCheck,
         add: IconAdd,
         search: IconSearch,
         bar: IconBarChart,
         column: IconColumnChart,
         line: IconLineChart,
         area: IconAreaChart,
         scatterplot: IconScatterplot
       };

export type IconName = keyof (typeof Icons);

export const Icon = ({
  size,
  color,
  name,
  ...props
}: {
  size?: number;
  color?: string;
  name: IconName;
}) => {
  const IconComponent = Icons[name];
  return <IconComponent size={size} color={color} {...props} />;
};
