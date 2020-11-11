import { ComponentProps } from "react";
import { IconAdd } from "./ic-add";
import { IconAreaChart } from "./ic-area-chart";
import { IconArrowDown } from "./ic-arrow-down";
import { IconArrowRight } from "./ic-arrow-right";
import { IconBarChart } from "./ic-bar-chart";
import { IconCaretDown } from "./ic-caret-down";
import { IconCaretRight } from "./ic-caret-right";
import { IconCheck } from "./ic-check";
import { IconChevronDown } from "./ic-chevron-down";
import { IconChevronLeft } from "./ic-chevron-left";
import { IconChevronRight } from "./ic-chevron-right";
import { IconChevronUp } from "./ic-chevron-up";
import { IconClear } from "./ic-clear";
import { IconColumnChart } from "./ic-column-chart";
import { IconCopy } from "./ic-copy";
import { IconDataset } from "./ic-dataset";
import { IconDatasetPublished } from "./ic-dataset-published";
import { IconDatasetWarning } from "./ic-dataset-warning";
import { IconDescription } from "./ic-description";
import { IconEmbed } from "./ic-embed";
import { IconFacebook } from "./ic-facebook";
import { IconFilter } from "./ic-filter";
import { IconHintWarning } from "./ic-hint-warning";
import { IconImage } from "./ic-image";
import { IconInfo } from "./ic-info";
import { IconLineChart } from "./ic-line-chart";
import { IconLoading } from "./ic-loading";
import { IconMail } from "./ic-mail";
import { IconPieChart } from "./ic-pie-chart";
import { IconResize } from "./ic-resize";
import { IconScatterplot } from "./ic-scatterplot";
import { IconSearch } from "./ic-search";
import { IconSegment } from "./ic-segment";
import { IconShare } from "./ic-share";
import { IconSort } from "./ic-sort";
import { IconTable } from "./ic-table";
import { IconText } from "./ic-text";
import { IconTwitter } from "./ic-twitter";
import { IconUnfold } from "./ic-unfold";
import { IconWarning } from "./ic-warning";
import { IconX } from "./ic-x";
import { IconY } from "./ic-y";
import { IconDragndrop } from "./ic-dragndrop";
import { IconSortAscending } from "./ic-sort-ascending";
import { IconSortDescending } from "./ic-sort-descending";

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
  arrowDown: IconArrowDown,
  title: IconText,
  description: IconDescription,
  dragndrop: IconDragndrop,
  sortAscending: IconSortAscending,
  sortDescending: IconSortDescending,
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
} & ComponentProps<"svg">) => {
  const IconComponent = Icons[name];
  return <IconComponent size={size} color={color} {...props} />;
};
