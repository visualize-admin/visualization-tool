import { ascending } from "d3-array";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { Row } from "react-table";

import { ColorMapping } from "@/config-types";
import { Component, getDimensionValueLabel, Observation } from "@/domain/data";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

export const makeColumnSortType = ({
  component,
  useAbbreviations,
}: {
  component: Component;
  useAbbreviations: boolean | undefined;
}) => {
  const sorters = makeDimensionValueSorters(component, {
    sorting: { sortingType: "byTableSortingType", sortingOrder: "asc" },
    useAbbreviations,
  });

  return (rowA: Row<Observation>, rowB: Row<Observation>, colId: string) => {
    for (const sorter of sorters) {
      const result = ascending(
        sorter(rowA.values[colId]),
        sorter(rowB.values[colId])
      );

      if (result) {
        return result;
      }
    }

    return 0;
  };
};

export const makeCategoryColorScale = ({
  dimension,
  colorMapping,
  useAbbreviations,
}: {
  dimension: Component;
  colorMapping: ColorMapping;
  useAbbreviations: boolean | undefined;
}) => {
  const labelsAndColors = Object.keys(colorMapping).map((value) => {
    const dimensionValue = dimension.values.find((d) => d.value === value);

    return {
      label: dimensionValue
        ? getDimensionValueLabel({ dimensionValue, useAbbreviations })
        : "unknown",
      color: colorMapping[value] ?? schemeCategory10[0],
    };
  });

  return scaleOrdinal<string>()
    .domain(labelsAndColors.map((d) => d.label))
    .range(labelsAndColors.map((d) => d.color));
};
