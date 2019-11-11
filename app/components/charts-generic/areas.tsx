import * as React from "react";
import { yAxisTheme, xAxisTheme, legendTheme } from "./chart-styles";
import { Spec } from "vega";
import { useVegaView } from "../../lib/use-vega";
import { AreaChartFields } from "../../domain";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta
} from "../../domain/data";

interface Props {
  data: Observations<AreaChartFields>;
  width: number;
  xField: string;
  yField: string;
  groupBy: string;
  groupByLabel: string;
  aggregateFunction: "sum";
  palette: string;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: AreaChartFields;
}

export const Areas = ({
  data,
  width,
  xField,
  yField,
  groupBy,
  groupByLabel,
  aggregateFunction,
  palette,
  fields,
  dimensions,
  measures
}: Props) => {
  const fieldValues = new Set([fields.xField, fields.groupByField]);
  const unmappedFields: [string, DimensionWithMeta][] = Object.entries(
    fields
  ).flatMap(([key, iri]) => {
    const mbDim = dimensions.find(d => d.component.iri.value === iri);
    return !fieldValues.has(iri) && mbDim ? [[key, mbDim]] : [];
  });
  const unmappedFieldKeys = unmappedFields.map(([key, value]) => key);

  const spec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width,
    height: width * 0.4,
    padding: { left: 16, right: 16, top: 64, bottom: 16 },
    autosize: { type: "fit-x", contains: "padding" },

    // title: { text: title, orient: "none", align: "left", fontSize: 16 },

    data: [
      {
        name: "table",
        values: data,
        transform: [
          // {
          //   type: "aggregate",
          //   groupby: [groupBy],
          //   fields: [yField],
          //   ops: ["sum"],
          //   as: ["sumByTime"]
          // },
          {
            type: "formula",
            as: "date",
            expr: `timeParse(datum.xField, "%Y")`
          },
          {
            type: "stack",
            field: yField,
            groupby: ["date"],
            sort: { field: [groupBy, ...unmappedFieldKeys] }
          },
          { type: "collect", sort: { field: "date" } }
        ]
      }
    ],

    scales: [
      {
        name: "x",
        type: "time",
        range: "width",

        domain: {
          data: "table",
          field: "date"
        }
      },
      {
        name: "y",
        type: "linear",
        range: "height",
        nice: true,
        zero: true,
        domain: {
          data: "table",
          field: "y1"
        }
      },
      {
        name: "colorScale",
        type: "ordinal",
        range: { scheme: palette },
        domain: {
          data: "table",
          field: groupBy
        }
      }
    ],

    axes: [
      { ...yAxisTheme, formatType: "number", format: "~s" },
      { ...xAxisTheme, formatType: "time", format: "%Y" }
    ],

    marks: [
      {
        type: "group",
        from: {
          facet: {
            name: "series",
            data: "table",
            groupby: [groupBy, ...unmappedFieldKeys]
          }
        },
        marks: [
          {
            type: "area",
            from: { data: "series" },
            encode: {
              enter: {
                x: { scale: "x", field: "date" },
                y: { scale: "y", field: "y0" },
                y2: { scale: "y", field: "y1" },
                fill: { scale: "colorScale", field: groupBy }
              },
              update: {
                fillOpacity: { value: 0.9 }
              },
              hover: {
                fillOpacity: { value: 1 }
              }
            }
          }
        ]
      }
    ],

    legends: [
      {
        ...legendTheme,
        fill: "colorScale"
        // title: groupByLabel
      }
    ]
  };

  return <AreasChart spec={spec} />;
};

const AreasChart = ({ spec }: { spec: Spec }) => {
  const [ref] = useVegaView({ spec });

  return <div ref={ref} />;
};
