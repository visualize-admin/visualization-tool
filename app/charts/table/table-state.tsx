import {
  extent,
  max,
  min,
  scaleDiverging,
  ScaleLinear,
  scaleLinear,
  scaleOrdinal,
  ScaleSequential,
} from "d3";
import { ReactNode, useMemo } from "react";
import { Column } from "react-table";

import {
  getLabelWithUnit,
  getSlugifiedIri,
} from "@/charts/shared/chart-helpers";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { BAR_CELL_PADDING, TABLE_HEIGHT } from "@/charts/table/constants";
import {
  ColumnStyleCategory,
  ColumnStyleHeatmap,
  ComponentType,
  TableConfig,
} from "@/configurator";
import {
  getColorInterpolator,
  mkNumber,
  useFormatNumber,
  useOrderedTableColumns,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import { estimateTextWidth } from "@/lib/estimate-text-width";
import { useTheme } from "@/themes";

export interface ColumnMeta {
  iri: string;
  slugifiedIri: string;
  columnComponentType: ComponentType;
  colorScale?: ScaleSequential<string>;
  widthScale?: ScaleLinear<number, number>;
  type: string;
  textStyle: string;
  textColor: string;
  columnColor: string;
  barColorPositive: string;
  barColorNegative: string;
  barColorBackground: string;
  barShowBackground: boolean;
}

export interface TableChartState {
  chartType: "table";
  bounds: Bounds;
  rowHeight: number;
  showSearch: boolean;
  data: Observation[];
  tableColumns: Column<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  groupingIris: string[];
  hiddenIris: string[];
  sortingIris: { id: string; desc: boolean }[];
}

const useTableState = ({
  data,
  dimensions,
  measures,
  chartConfig,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  chartConfig: TableConfig;
}): TableChartState => {
  const theme = useTheme();
  const { fields, settings, sorting } = chartConfig;
  const formatNumber = useFormatNumber();

  const hasBar = Object.values(fields).some(
    (fValue) => fValue.columnStyle.type === "bar"
  );
  const rowHeight = hasBar ? 56 : 40;

  // Dimensions
  const width = useWidth();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const chartWidth = width - margins.left - margins.right; // We probably don't need this
  const chartHeight = Math.min(TABLE_HEIGHT, data.length * rowHeight);
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  const orderedTableColumns = useOrderedTableColumns(fields);

  /**
   * REACT-TABLE CONFIGURATION
   * React-table is a headless hook, the following code
   * is used to manage its internal state from the editor.
   */

  const types = [...dimensions, ...measures].reduce(
    (obj, c) => ({ ...obj, [getSlugifiedIri(c.iri)]: c.__typename }),
    {} as { [x: string]: ComponentType }
  );
  // Data used by react-table
  const memoizedData = useMemo(
    function replaceKeys() {
      //Only read keys once
      const keys = Object.keys(data[0]);
      const slugifiedKeys = keys.map(getSlugifiedIri);

      return data.map((d, index) => {
        let o = { id: index } as $IntentionalAny;
        // This is run often, so let's optimize it
        for (let i = 0; i < keys.length; i++) {
          o[slugifiedKeys[i]] =
            types[slugifiedKeys[i]] !== "Measure"
              ? d[keys[i]]
              : d[keys[i]] !== null
              ? +d[keys[i]]!
              : null;
        }
        return o;
      });
    },
    [data, types]
  );
  // Columns used by react-table
  const tableColumns = useMemo(() => {
    return orderedTableColumns.map((c) => {
      const headerDimension = [...dimensions, ...measures].find(
        (dim) => dim.iri === c.componentIri
      );

      if (!headerDimension) {
        throw Error(`No dimension <${c.componentIri}> in cube!`);
      }

      const headerLabel = getLabelWithUnit(headerDimension);

      // The column width depends on the estimated width of the
      // longest value in the column, with a minimum of 150px.
      const columnItems = [...new Set(data.map((d) => d[c.componentIri]))];
      const columnItemSizes = [
        ...columnItems.map((item) => {
          const itemAsString =
            c.componentType === "Measure" ? formatNumber(item as number) : item;
          return estimateTextWidth(`${itemAsString}`, 16) + 20;
        }),
      ];

      const width = Math.max(
        50,
        estimateTextWidth(headerLabel, 16) + 44,
        ...columnItemSizes
      );

      return {
        Header: headerLabel,
        // Slugify accessor to avoid IRI's "." to be parsed as JS object notation.
        accessor: getSlugifiedIri(c.componentIri),

        width,
        // If sort type is not "basic", react-table default to "alphanumeric"
        // which doesn't sort negative values properly.
        sortType: "basic",
      };
    });
  }, [orderedTableColumns, data, dimensions, measures, formatNumber]);

  // Groupings used by react-table
  const groupingIris = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isGroup)
        .map((c) => getSlugifiedIri(c.componentIri)),
    [orderedTableColumns]
  );

  // Sorting used by react-table
  const sortingIris = useMemo(() => {
    return [
      // Prioritize the configured sorting
      ...sorting.map((s) => ({
        id: getSlugifiedIri(s.componentIri),
        desc: s.sortingOrder === "desc",
      })),
      // Add the remaining table columns to the sorting
      ...orderedTableColumns.flatMap((c) => {
        return sorting.some((s) => s.componentIri === c.componentIri)
          ? []
          : [
              {
                id: getSlugifiedIri(c.componentIri),
                desc: false,
              },
            ];
      }),
    ];
  }, [sorting, orderedTableColumns]);

  const hiddenIris = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isHidden)
        .map((c) => getSlugifiedIri(c.componentIri)),
    [orderedTableColumns]
  );

  /**
   * TABLE FORMATTING
   * tableColumnsMeta contains styles for columns/cell components.
   * It is not used by react-table, only for custom styling.
   */
  const tableColumnsMeta = useMemo(
    () =>
      Object.keys(fields).reduce((acc, iri, i) => {
        const columnMeta = fields[iri];
        const slugifiedIri = getSlugifiedIri(iri);
        const columnStyle = columnMeta.columnStyle;
        const columnStyleType = columnStyle.type;
        const columnComponentType = columnMeta.componentType;

        if (columnStyleType === "text") {
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "category") {
          const { colorMapping } = columnStyle as ColumnStyleCategory;
          const dimension = dimensions.find(
            (d) => d.iri === iri
          ) as DimensionMetaDataFragment;

          // Color scale (always from colorMappings)
          const colorScale = scaleOrdinal();

          // get label (translated) matched with color
          const labelsAndColor = Object.keys(colorMapping).map(
            (colorMappingIri) => {
              const dvLabel = (
                dimension.values.find((s) => {
                  return s.value === colorMappingIri;
                }) || { label: "unknown" }
              ).label;

              return {
                label: dvLabel,
                color:
                  colorMapping![colorMappingIri] || theme.palette.primary.main,
              };
            }
          );

          colorScale.domain(labelsAndColor.map((s) => s.label));
          colorScale.range(labelsAndColor.map((s) => s.color));

          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              colorScale,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "heatmap") {
          const absMinValue =
            min(data, (d) =>
              d[iri] !== null ? Math.abs(d[iri] as number) : 0
            ) || 0;
          const absMaxValue =
            max(data, (d) =>
              d[iri] !== null ? Math.abs(d[iri] as number) : 1
            ) || 1;
          const maxAbsoluteValue = Math.max(absMinValue, absMaxValue);
          const colorScale = scaleDiverging(
            getColorInterpolator((columnStyle as ColumnStyleHeatmap).palette)
          ).domain([-maxAbsoluteValue, 0, maxAbsoluteValue] || [-1, 0, 1]);
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              colorScale,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "bar") {
          // The column width depends on the estimated width of the
          // longest value in the column, with a minimum of 150px.
          const columnItems = [
            ...new Set(
              data.map((d) =>
                d !== null && d[iri] !== null ? mkNumber(d[iri]) : NaN
              )
            ),
          ];
          const columnItemSizes = columnItems.map((item) => {
            const itemAsString =
              columnComponentType === "Measure"
                ? formatNumber(item as number)
                : item;
            return estimateTextWidth(`${itemAsString}`, 16) + 80;
          });
          const width =
            Math.max(max(columnItemSizes, (d) => d) || 150, 150) -
            BAR_CELL_PADDING * 2;
          // const hasNegativeValue =
          //   (min(data, (d) => Math.abs(+d[iri])) || 0) < 0;
          const domain = extent(columnItems, (d) => d) as [number, number];
          const widthScale = scaleLinear().domain(domain).range([0, width]);

          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              widthScale,
              ...columnStyle,
            },
          };
        } else {
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              ...columnStyle,
            },
          };
        }
      }, {}),
    [data, dimensions, fields, formatNumber, theme.palette.primary.main]
  );

  return {
    chartType: "table",
    bounds,
    rowHeight,
    showSearch: settings.showSearch,
    data: memoizedData,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    hiddenIris,
    sortingIris,
  };
};

//  ------------------------------------------------------------------------------------ //
//  ------------------------------------------------------------------------------------ //

const TableChartProvider = ({
  data,
  dimensions,
  measures,
  children,
  chartConfig,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  chartConfig: TableConfig;
}) => {
  const state = useTableState({
    data,
    dimensions,
    measures,
    chartConfig,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = ({
  data,
  dimensions,
  measures,
  chartConfig,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  chartConfig: TableConfig;
}) => {
  return (
    <Observer>
      <TableChartProvider
        data={data}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
      >
        {children}
      </TableChartProvider>
    </Observer>
  );
};
