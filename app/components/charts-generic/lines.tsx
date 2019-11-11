import * as React from "react";
import { Spec } from "vega";
import { LineChartFields } from "../../domain";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta,
  getDimensionLabel
} from "../../domain/data";
import { legendTheme, xAxisTheme, yAxisTheme } from "./chart-styles";
import { useVegaView } from "../../lib/use-vega";

interface Props {
  data: Observations<LineChartFields>;
  width: number;
  xField: string;
  yField: string;
  groupBy: string;
  groupByLabel: string;
  aggregateFunction: "sum";
  palette: string;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: LineChartFields;
}

export const Lines = ({
  data,
  width,
  xField,
  yField,
  groupBy,
  groupByLabel,
  aggregateFunction,
  dimensions,
  measures,
  fields,
  palette
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
          //   groupby: [xField, groupBy],
          //   fields: [yField, yField],
          //   ops: [aggregateFunction, aggregateFunction],
          //   as: ["byTime", "byGroup"]
          // },
          {
            type: "formula",
            as: "date",
            expr: `timeParse(datum.xField, "%Y")`
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
          field: yField
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
            type: "line",
            from: {
              data: "series"
            },
            encode: {
              enter: {
                x: {
                  scale: "x",
                  field: "date"
                },
                y: {
                  scale: "y",
                  field: yField
                },
                stroke: {
                  scale: "colorScale",
                  field: groupBy
                },

                strokeWidth: {
                  value: 1
                }
              },

              hover: {
                fillOpacity: {
                  value: 0.5
                }
              }
            }
          }
        ]
      }
    ],
    legends: [
      {
        ...legendTheme,
        stroke: "colorScale",
        symbolType: "stroke"
        // title: groupByLabel
      }
    ]
  };

  return <LinesChart spec={spec} />;
};

const LinesChart = ({ spec }: { spec: Spec }) => {
  const [ref] = useVegaView({ spec });

  return <div ref={ref} />;
};
