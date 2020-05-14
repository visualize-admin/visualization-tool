import * as React from "react";
import { IconCheck } from "./ic-check";
import { IconAdd } from "./ic-add";
import { IconClear } from "./ic-clear";
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
import { IconPieChart } from "./ic-pie-chart";
import { IconScatterplot } from "./ic-scatterplot";
import { IconDataset } from "./ic-dataset";
import { IconDatasetPublished } from "./ic-dataset-published";
import { IconDatasetWarning } from "./ic-dataset-warning";
import { IconLoading } from "./ic-loading";
import { IconWarning } from "./ic-warning";
import { IconHintWarning } from "./ic-hint-warning";
import { IconResize } from "./ic-resize";
import { IconTable } from "./ic-table";
import { IconSegment } from "./ic-segment";
import { IconFilter } from "./ic-filter";
import { IconX } from "./ic-x";
import { IconY } from "./ic-y";
import { IconShare } from "./ic-share";
import { IconSort } from "./ic-sort";
import { IconCopy } from "./ic-copy";
import { IconEmbed } from "./ic-embed";
import { IconFacebook } from "./ic-facebook";
import { IconImage } from "./ic-image";
import { IconMail } from "./ic-mail";
import { IconTwitter } from "./ic-twitter";
import { IconText } from "./ic-text";
import { IconInfo } from "./ic-info";
import { IconArrowRight } from "./ic-arrow-right";
import { IconArrowDown } from "./ic-arrow-down";

export const Icons = {
  check: IconCheck,
  add: IconAdd,
  clear: IconClear,
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
  pie: IconPieChart,
  scatterplot: IconScatterplot,
  dataset: IconDataset,
  datasetWarning: IconDatasetWarning,
  published: IconDatasetPublished,
  loading: IconLoading,
  warning: IconWarning,
  hintWarning: IconHintWarning,
  resize: IconResize,
  table: IconTable,
  x: IconX,
  y: IconY,
  segment: IconSegment,
  filter: IconFilter,
  share: IconShare,
  sort: IconSort,
  copy: IconCopy,
  embed: IconEmbed,
  facebook: IconFacebook,
  image: IconImage,
  mail: IconMail,
  twitter: IconTwitter,
  text: IconText,
  info: IconInfo,
  arrowRight: IconArrowRight,
  arrowDown: IconArrowDown
};

export type IconName = keyof typeof Icons;

export const Icon = ({
  size,
  color,
  name,
  ...props
}: {
  size?: number;
  color?: string;
  name: IconName;
} & React.ComponentProps<"svg">) => {
  const IconComponent = Icons[name];
  return <IconComponent size={size} color={color} {...props} />;
};
