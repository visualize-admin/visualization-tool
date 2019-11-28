import * as React from "react";
import { legendTheme, xAxisTheme, yAxisTheme } from "./chart-styles";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta,
  getDimensionLabel
} from "../../domain/data";
import { ColumnFields, FieldType, BarFields } from "../../domain";
import { useVegaView } from "../../lib/use-vega";
import { Spec } from "vega";

interface Props {
  data: Observations<BarFields>;
  width: number;
  fields: ColumnFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

export const ColumnsSegment = ({
  data,
  width,
  fields,
  dimensions,
  measures
}: Props) => {
  const xFieldLabel = getDimensionLabel(
    dimensions.find(d => d.component.iri.value === fields.x.componentIri)!
  );
  const fieldValues = new Set([fields.x.componentIri, fields.y.componentIri]);
  const unmappedFields = Object.entries(fields).flatMap(([key, field]) => {
    const mbDim = dimensions.find(
      d => d.component.iri.value === (field as FieldType).componentIri
    );
    return !fieldValues.has((field as FieldType).componentIri) && mbDim
      ? [[key, mbDim]]
      : [];
  });

  // STACKED ------------------------------------------------------------------------------//
  const stackedSpec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      { name: "labels", values: [{ key: "xField", value: "X FIELD" }] },
      {
        name: "table",
        values: data,
        transform: [
          {
            type: "formula",
            expr: unmappedFields
              .map(f => f[0])
              .map(s => `datum["${s}"]`)
              .join("+', '+"),
            as: "tooltipLabel"
          },
          {
            type: "stack",
            groupby: ["x"],
            sort: { field: "segment" },
            field: "y"
          }
        ]
      }
    ],

    signals: [
      {
        name: "tooltip",
        value: {},
        on: [
          { events: "rect:mouseover", update: "datum" },
          { events: "rect:mouseout", update: "{}" }
        ]
      }
    ],

    scales: [
      {
        name: "x",
        type: "band",
        domain: { data: "table", field: "x", sort: true },
        range: "width",
        padding: 0.3,
        paddingOuter: 0.3,
        round: false
      },
      {
        name: "y",
        domain: { data: "table", field: "y1" },
        nice: true,
        range: "height"
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
      // {
      //   name: "labelScale",
      //   type: "ordinal",
      //   domain: { data: "labels", field: "key" },
      //   range: { data: "labels", field: "value" }
      // }
    ],

    axes: [
      { ...yAxisTheme, formatType: "number", format: ",.2~f" },
      {
        ...xAxisTheme,
        labelAngle: -90,
        labelAlign: "right",
        ticks: false,
        title: xFieldLabel
        // encode: { title: { update: { text: { "signal": "scales.labelsScale('xField')" } } } }
      }
    ],

    marks: [
      {
        type: "rect",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "x", field: "x" },
            width: { scale: "x", band: 1 },
            y: { scale: "y", field: "y0" },
            y2: { scale: "y", field: "y1" }
          },
          update: {
            fillOpacity: { value: 0.9 },
            fill: { scale: "colorScale", field: "segment" }
          },
          hover: {
            fillOpacity: { value: 1 }
          }
        }
      },
      {
        type: "text",
        encode: {
          enter: {
            align: { value: "center" },
            baseline: { value: "bottom" },
            fill: { value: "#454545" },
            fontSize: { value: 12 }
          },
          update: {
            x: { scale: "x", signal: `tooltip["x"]`, band: 0.5 },
            y: { scale: "y", signal: "tooltip.y1", offset: -2 },
            text: {
              signal: `tooltip.y ? tooltip.tooltipLabel + " " +format(tooltip.y, ',.2~f') : ''`
            },
            fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }]
          }
        }
      }
    ],
    legends: [
      {
        ...legendTheme,
        fill: "colorScale",
        // title: groupByLabel
        columns: 1,
        labelLimit: width - 60
      }
    ]
  };

  // GROUPED ------------------------------------------------------------------------------//
  const groupedSpec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      // { name: "labels", values: [{ key: "xField", value: "X FIELD" }] },
      {
        name: "table",
        values: data
      }
    ],

    scales: [
      {
        name: "xscale",
        type: "band",
        domain: { data: "table", field: "x", sort: true },
        range: "width",
        padding: 0.3,
        round: false
      },
      {
        name: "yscale",
        type: "linear",
        domain: { data: "table", field: "y" },
        nice: true,
        zero: true,
        range: "height"
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
      {
        ...yAxisTheme,
        orient: "left",
        scale: "yscale",
        formatType: "number",
        format: ",.2~f"
      },
      {
        ...xAxisTheme,
        orient: "bottom",
        scale: "xscale",
        labelAlign: "center",
        ticks: false,
        labelPadding: 16,
        zindex: 1
        // title: xFieldLabel
        // encode: { title: { update: { text: { "signal": "scales.labelsScale('xField')" } } } }
      }
    ],

    marks: [
      {
        type: "group",
        from: {
          facet: {
            data: "table",
            name: "facet",
            groupby: "x"
          }
        },
        encode: {
          enter: {
            x: { scale: "xscale", field: "x" }
          }
        },

        signals: [
          {
            name: "width",
            update: "bandwidth('xscale')"
          }
        ],

        scales: [
          {
            name: "segmentScale",
            type: "band",
            range: "width",
            domain: { data: "facet", field: "segment" }
          }
        ],
        marks: [
          {
            name: "bars",
            from: { data: "facet" },
            type: "rect",
            encode: {
              enter: {
                x: { scale: "segmentScale", field: "segment" },
                width: { scale: "segmentScale", band: 1 },
                y: { scale: "yscale", field: "y" },
                y2: { scale: "yscale", value: 0 },
                fill: { scale: "colorScale", field: "segment" }
              }
            }
          }
        ]
      }
    ],
    legends: [
      {
        ...legendTheme,
        fill: "colorScale",
        // title: groupByLabel
        columns: 1,
        labelLimit: width - 60
      }
    ]
  };
  return (
    <ColumnsSegmentChart
      spec={
        fields.segment && fields.segment.type === "stacked"
          ? stackedSpec
          : groupedSpec
      }
    />
  );
};

const ColumnsSegmentChart = ({ spec }: { spec: Spec }) => {
  const [ref] = useVegaView({ spec });
  return <div ref={ref} />;
};
