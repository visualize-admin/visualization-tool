import * as React from "react";
import { Spec } from "vega";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta,
  getDimensionLabel
} from "../../domain/data";
import { legendTheme, xAxisTheme, yAxisTheme } from "./chart-styles";
import { useVegaView } from "../../lib/use-vega";
import { LineFields } from "../../domain";

interface Props {
  data: Observations<LineFields>;
  width: number;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: LineFields;
}

export const Lines = ({ data, width, dimensions, measures, fields }: Props) => {
  const fieldValues = new Set([fields.x.componentIri]);
  const unmappedFields: [string, DimensionWithMeta][] = Object.entries<{
    componentIri: string;
  }>(fields).flatMap(([key, fieldValue]) => {
    const mbDim = dimensions.find(
      d => d.component.iri.value === fieldValue.componentIri
    );
    return !fieldValues.has(fieldValue.componentIri) && mbDim
      ? [[key, mbDim]]
      : [];
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
            expr: `timeParse(datum.x, "%Y")`
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
          field: "y"
        }
      },
      {
        name: "colorScale",
        type: "ordinal",
        range: {
          scheme: fields.segment ? fields.segment.palette : "category10"
        },
        domain: {
          data: "table",
          field: "segment"
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
            groupby: ["segment", ...unmappedFieldKeys]
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
                  field: "y"
                },
                stroke: {
                  scale: "colorScale",
                  field: "segment"
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
