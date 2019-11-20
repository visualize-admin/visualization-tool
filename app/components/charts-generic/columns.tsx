import * as React from "react";
import { legendTheme, xAxisTheme, yAxisTheme } from "./chart-styles";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta,
  getDimensionLabel
} from "../../domain/data";
import { ColumnFields, FieldType } from "../../domain";
import { useVegaView } from "../../lib/use-vega";
import { Spec } from "vega";

interface Props {
  data: Observations<ColumnFields>;
  width: number;
  fields: ColumnFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

export const Columns = ({
  data,
  width,
  fields,
  dimensions,
  measures
}: Props) => {
  // FIXME: we probably could inline these in the specs.
  const xField = "x";
  const heightField = "y";
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
  const spec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      { name: "labels", values: [{ key: xField, value: "X FIELD" }] },
      {
        name: "table",
        values: data
        // transform: [
        //   // {
        //   //   type: "aggregate",
        //   //   groupby: [xField, groupBy],
        //   //   fields: [heightField],
        //   //   ops: [aggregateFunction],
        //   //   as: ["sum"]
        //   // },
        //   {
        //     type: "formula",
        //     expr: unmappedFields
        //       .map(f => f[0])
        //       .map(s => `datum["${s}"]`)
        //       .join("+', '+"),
        //     as: "tooltipLabel"
        //   }
        //   // {
        //   //   type: "stack",
        //   //   groupby: [xField],
        //   //   sort: { field: groupBy },
        //   //   field: heightField
        //   // }
        // ]
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
        domain: { data: "table", field: xField, sort: true },
        range: "width",
        padding: 0.3,
        paddingOuter: 0.3,
        round: false
      },
      {
        name: "y",
        domain: { data: "table", field: heightField },
        nice: true,
        range: "height"
      }
      // {
      //   name: "colorScale",
      //   type: "ordinal",
      //   range: { scheme: palette },
      //   domain: {
      //     data: "table",
      //     field: groupBy
      //   }
      // }
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
            x: { scale: "x", field: xField },
            width: { scale: "x", band: 1 },
            y: { scale: "y", field: heightField },
            y2: { scale: "y", value: 0 }
          },
          update: {
            fillOpacity: { value: 0.9 },
            fill: { value: "blue" }
          },
          hover: {
            fillOpacity: { value: 1 }
          }
        }
      }
      // {
      //   type: "text",
      //   encode: {
      //     enter: {
      //       align: { value: "center" },
      //       baseline: { value: "bottom" },
      //       fill: { value: "#454545" },
      //       fontSize: { value: 12 }
      //     },
      //     update: {
      //       x: { scale: "x", signal: `tooltip["${xField}"]`, band: 0.5 },
      //       y: { scale: "y", signal: "tooltip.y", offset: -2 },
      //       text: {
      //         signal: `tooltip.heightField ? tooltip.tooltipLabel + " " +format(tooltip.y, ',.2~f') : ''`
      //       },
      //       fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }]
      //     }
      //   }
      // }
    ]
    // legends: [
    //   {
    //     ...legendTheme,
    //     fill: "colorScale",
    //     // title: groupByLabel
    //     columns: 1,
    //     labelLimit: width - 60
    //   }
    // ]
  };
  return <ColumnsChart spec={spec} />;
};

const ColumnsChart = ({ spec }: { spec: Spec }) => {
  const [ref] = useVegaView({ spec });
  return <div ref={ref} />;
};
