import { extent, max, min } from "d3-array";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

import { BAR_CELL_PADDING } from "@/charts/table/constants";
import { ColumnStyle, TableFields } from "@/config-types";
import { mkNumber } from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { getTextWidth } from "@/utils/get-text-width";
import { useStableIds } from "@/utils/use-stable-ids";

const MIN_BAR_WIDTH = 150;
const BAR_TEXT_PADDING = 80;
const FONT_SIZE = 16;

type Formatter = (value: number) => string;

export const useColumnStats = ({
  fields,
  observations,
  formatters,
}: {
  fields: TableFields;
  observations: Observation[];
  formatters: Record<string, Formatter>;
}) => {
  const barIds = useStableIds(getColumnIdsWithStyle({ fields, type: "bar" }));
  const heatmapIds = useStableIds(
    getColumnIdsWithStyle({ fields, type: "heatmap" })
  );
  const barWidthScales = useMemo(() => {
    return Object.fromEntries(
      barIds.map((componentId) => [
        componentId,
        getBarWidthScale({
          observations,
          componentId,
          formatter: formatters[componentId],
        }),
      ])
    );
  }, [barIds, observations, formatters]);
  const heatmapMaxAbsoluteValues = useMemo(() => {
    return Object.fromEntries(
      heatmapIds.map((componentId) => [
        componentId,
        getMaxAbsoluteValue({ observations, componentId }),
      ])
    );
  }, [heatmapIds, observations]);

  return { barWidthScales, heatmapMaxAbsoluteValues };
};

export const getBarWidthScale = ({
  observations,
  componentId,
  formatter,
}: {
  observations: Observation[];
  componentId: string;
  formatter: Formatter;
}) => {
  const values = [
    ...new Set(
      observations.map((d) =>
        d[componentId] !== null ? mkNumber(d[componentId]) : NaN
      )
    ),
  ];
  const textWidths = values.map(
    (value) =>
      getTextWidth(`${formatter(value)}`, { fontSize: FONT_SIZE }) +
      BAR_TEXT_PADDING
  );
  const width =
    Math.max(max(textWidths) || MIN_BAR_WIDTH, MIN_BAR_WIDTH) -
    BAR_CELL_PADDING * 2;

  return scaleLinear()
    .domain(extent(values) as [number, number])
    .range([0, width]);
};

export const getMaxAbsoluteValue = ({
  observations,
  componentId,
}: {
  observations: Observation[];
  componentId: string;
}) => {
  const absMin =
    min(observations, (d) =>
      d[componentId] !== null ? Math.abs(d[componentId] as number) : 0
    ) || 0;
  const absMax =
    max(observations, (d) =>
      d[componentId] !== null ? Math.abs(d[componentId] as number) : 1
    ) || 1;

  return Math.max(absMin, absMax);
};

const getColumnIdsWithStyle = ({
  fields,
  type,
}: {
  fields: TableFields;
  type: ColumnStyle["type"];
}) => {
  return Object.values(fields)
    .filter((field) => field.columnStyle.type === type)
    .map((field) => field.componentId);
};
