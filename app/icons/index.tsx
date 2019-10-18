import * as React from "react";
import { IconCheck } from "./ic-check";
import { IconAdd } from "./ic-add";
import { IconSearch } from "./ic-search";
import { IconBarChart } from "./ic-bar-chart";
import { IconColumnChart } from "./ic-column-chart";
import { IconLineChart } from "./ic-line-chart";
import { IconAreaChart } from "./ic-area-chart";
import { IconScatterplot } from "./ic-scatterplot";
import { IconChevronDown } from "./ic-chevron-down";
import { IconChevronRight } from "./ic-chevron-right";
import { IconCaretDown } from "./ic-caret-down";
import { IconCaretRight } from "./ic-caret-right";

export const Icons = {
  check: IconCheck,
  add: IconAdd,
  chevrondown: IconChevronDown,
  chevronright: IconChevronRight,
  caretdown: IconCaretDown,
  caretright: IconCaretRight,
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
