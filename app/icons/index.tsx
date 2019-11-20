import * as React from "react";
import { IconCheck } from "./ic-check";
import { IconAdd } from "./ic-add";
import { IconSearch } from "./ic-search";
import { IconChevronUp } from "./ic-chevron-up";
import { IconChevronDown } from "./ic-chevron-down";
import { IconChevronLeft } from "./ic-chevron-left";
import { IconChevronRight } from "./ic-chevron-right";
import { IconCaretDown } from "./ic-caret-down";
import { IconCaretRight } from "./ic-caret-right";
import { IconUnfold } from "./ic-unfold";
import { IconBarChart } from "./ic-bar-chart";
import { IconColumnChart } from "./ic-column-chart";
import { IconLineChart } from "./ic-line-chart";
import { IconAreaChart } from "./ic-area-chart";
import { IconScatterplot } from "./ic-scatterplot";
import { IconDataset } from "./ic-dataset";
import { IconDatasetPublished } from "./ic-dataset-published";
import { IconLoading } from "./ic-loading";
import { IconWarning } from "./ic-warning";
import { IconResize } from "./ic-resize";
import { IconTable } from "./ic-table";
import { IconSegment } from "./ic-segment";
import { IconFilter } from "./ic-filter";
import { IconX } from "./ic-x";
import { IconY } from "./ic-y";

export const Icons = {
  check: IconCheck,
  add: IconAdd,
  search: IconSearch,
  chevronup: IconChevronUp,
  chevrondown: IconChevronDown,
  chevronleft: IconChevronLeft,
  chevronright: IconChevronRight,
  caretdown: IconCaretDown,
  caretright: IconCaretRight,
  unfold: IconUnfold,
  bar: IconBarChart,
  column: IconColumnChart,
  line: IconLineChart,
  area: IconAreaChart,
  scatterplot: IconScatterplot,
  dataset: IconDataset,
  published: IconDatasetPublished,
  loading: IconLoading,
  warning: IconWarning,
  resize: IconResize,
  table: IconTable,
  x: IconX,
  y: IconY,
  segment: IconSegment,
  filter: IconFilter
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
