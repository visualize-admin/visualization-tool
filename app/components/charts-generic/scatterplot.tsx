import * as React from "react";
import { Spec } from "vega";
import { ScatterPlotFields } from "../../domain";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation,
  getDimensionLabel
} from "../../domain/data";
import { useVegaView } from "../../lib/use-vega";
import { legendTheme, useChartTheme } from "./styles";
import { useTheme } from "../../themes";

interface Props {
  data: Observation[];
  width: number;
  fields: ScatterPlotFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

export const Scatterplot = ({
  data,
  width,
  fields,
  dimensions,
  measures
}: Props) => {
  const { labelColor, domainColor, gridColor, fontFamily } = useChartTheme();
  const theme = useTheme();

  const xFieldLabel = getDimensionLabel(
    measures.find(d => d.component.iri.value === fields.x.componentIri)!
  );
  const yFieldLabel = getDimensionLabel(
    measures.find(d => d.component.iri.value === fields.y.componentIri)!
  );
  const spec: Spec = !fields.segment
    ? {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        width: width,
        height: width * 0.4,
        padding: { left: 16, right: 16, top: 16, bottom: 16 },

        autosize: { type: "fit-x", contains: "padding" },

        data: [
          {
            name: "table",
            values: data,
            transform: [
              { type: "filter", expr: "isValid(datum.y) && isValid(datum.x)" }
            ]
          }
        ],

        scales: [
          {
            name: "x",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "table", field: "x" },
            range: "width"
          },
          {
            name: "y",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "table", field: "y" },
            range: "height"
          }
        ],

        axes: [
          {
            scale: "y",
            orient: "left",
            formatType: "number",
            format: ",.2~f",
            bandPosition: 0.5,
            labelFont: fontFamily,
            labelColor: labelColor,
            labelFontSize: 12,
            labelPadding: 8,
            domain: true,
            domainColor,
            ticks: true,
            tickCount: 5,
            tickColor: gridColor,
            grid: true,
            gridColor,
            domainWidth: 1,
            title: yFieldLabel,
            titleFont: fontFamily,
            titleColor: labelColor,
            titleY: -16,
            titleX: 0,
            titlePadding: 16,
            titleAngle: 0,
            titleAnchor: "start",
            titleAlign: "left"
          },
          {
            scale: "x",
            orient: "bottom",
            formatType: "number",
            format: ",.2~f",
            bandPosition: 1,
            domainColor,
            domainWidth: 1,
            labelColor,
            labelFont: fontFamily,
            labelFontSize: 12,
            labelBaseline: "middle",
            labelPadding: 8,
            domain: true,
            ticks: true,
            tickCount: 5,
            tickColor: gridColor,
            grid: true,
            gridColor,
            title: xFieldLabel,
            titleFont: fontFamily,
            titleColor: labelColor,
            titlePadding: 16,
            titleAngle: 0,
            titleAnchor: "end",
            titleAlign: "right"
          }
        ],

        marks: [
          {
            name: "dots",
            type: "symbol",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "x", field: "x" },
                y: { scale: "y", field: "y" },
                shape: { value: "circle" },
                strokeWidth: { value: 0 },
                opacity: { value: 0.6 },
                stroke: { value: "transparent" },
                fill: { value: theme.colors.primary }
              }
            }
          }
        ]
      }
    : {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        width: width,
        height: width * 0.4,
        padding: { left: 16, right: 16, top: 16, bottom: 16 },

        autosize: { type: "fit-x", contains: "padding" },

        data: [
          {
            name: "table",
            values: data,
            transform: [
              { type: "filter", expr: "isValid(datum.y) && isValid(datum.x)" }
            ]
            // transform: [
            //   {
            //     type: "nest",
            //     keys: ["segment"],
            //     as: "byGroup"
            //   }
            // ]
          }
        ],

        scales: [
          {
            name: "x",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "table", field: "x" },
            range: "width"
          },
          {
            name: "y",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "table", field: "y" },
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
            scale: "y",
            orient: "left",
            formatType: "number",
            format: ",.2~f",
            bandPosition: 0.5,
            labelFont: fontFamily,
            labelColor: labelColor,
            labelFontSize: 12,
            labelPadding: 8,
            domain: true,
            domainColor,
            ticks: true,
            tickCount: 5,
            tickColor: gridColor,
            grid: true,
            gridColor,
            domainWidth: 1,
            title: yFieldLabel,
            titleFont: fontFamily,
            titleColor: labelColor,
            titleY: -16,
            titleX: 0,
            titlePadding: 16,
            titleAngle: 0,
            titleAnchor: "start",
            titleAlign: "left"
          },
          {
            scale: "x",
            orient: "bottom",
            formatType: "number",
            format: ",.2~f",
            bandPosition: 1,
            domainColor,
            domainWidth: 1,
            labelColor,
            labelFont: fontFamily,
            labelFontSize: 12,
            labelBaseline: "middle",
            labelPadding: 8,
            // labelAlign: "right",
            // labelAngle: -90,
            domain: true,
            ticks: true,
            tickCount: 5,
            tickColor: gridColor,
            grid: true,
            gridColor,
            title: xFieldLabel,
            titleFont: fontFamily,
            titleColor: labelColor,
            titlePadding: 16,
            titleAngle: 0,
            titleAnchor: "end",
            titleAlign: "right"
          }
        ],

        marks: [
          // {
          //   type: "line",
          //   from: { data: "table" },
          //   encode: {
          //     enter: {
          //       interpolate: { value: "monotone" },
          //       x: { scale: "x", field: "x" },
          //       y: { scale: "y", field: "y" },
          //       stroke: { scale: "colorScale", field: "segment" },
          //       strokeWidth: { value: 1 }
          //     }
          //   }
          // },

          {
            name: "dots",
            type: "symbol",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "x", field: "x" },
                y: { scale: "y", field: "y" },
                shape: { value: "circle" },
                strokeWidth: { value: 0 },
                opacity: { value: 0.6 },
                stroke: { value: "transparent" },
                fill: { scale: "colorScale", field: "segment" } //{ value: vega.scheme(palette)[0] }
              }
            }
          }
          // {
          //   name: "label",
          //   type: "text",
          //   from: { data: "table" },
          //   encode: {
          //     enter: {
          //       x: { scale: "x", field: "x" },
          //       y: { scale: "y", field: "y" },
          //       dx: { value: 5 },
          //       dy: { value: -5 },
          //       fill: { value: labelColor },
          //       text: { value: "FIXME" }
          //     }
          //   }
          // }
        ],
        legends: [
          {
            ...legendTheme,
            fill: "colorScale",
            symbolType: "circle"
          }
        ]
      };
  return <ScatterplotChart spec={spec} />;
};

const ScatterplotChart = ({ spec }: { spec: $FixMe }) => {
  const [ref] = useVegaView({ spec });
  return <div ref={ref} />;
};
