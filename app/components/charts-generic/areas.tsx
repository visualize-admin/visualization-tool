import * as React from "react";
import { yAxisTheme, xAxisTheme, legendTheme } from "./chart-styles";
import { Spec } from "vega";
import { useVegaView } from "../../lib/use-vega";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta
} from "../../domain/data";
import { AreaFields } from "../../domain";

interface Props {
  data: Observations<AreaFields>;
  width: number;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: AreaFields;
}

export const Areas = ({ data, width, fields, dimensions, measures }: Props) => {
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
          //   groupby: [groupBy],
          //   fields: [yField],
          //   ops: ["sum"],
          //   as: ["sumByTime"]
          // },
          {
            type: "formula",
            as: "date",
            expr: `timeParse(datum.x, "%Y")`
          },
          {
            type: "stack",
            field: "y",
            groupby: ["date"],
            sort: { field: ["segment", ...unmappedFieldKeys] }
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
            type: "area",
            from: { data: "series" },
            encode: {
              enter: {
                x: { scale: "x", field: "date" },
                y: { scale: "y", field: "y0" },
                y2: { scale: "y", field: "y1" },
                fill: { scale: "colorScale", field: "segment" }
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
