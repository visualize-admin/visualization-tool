import * as React from "react";
import { Spec } from "vega";
import { xAxisTheme, yAxisTheme, legendTheme } from "./chart-styles";
import { useTheme } from "../../themes";
import { Observations, DimensionWithMeta, MeasureWithMeta } from "../../domain/data";
import { ScatterPlotFields } from "../../domain";
import { useVegaView } from "../../lib/use-vega";

interface Props {
  data: Observations<ScatterPlotFields>;
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
  const theme = useTheme();
  const spec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      {
        name: "table",
        values: data
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
        range: { scheme: fields.segment ? fields.segment.palette : "category10" },
        domain: {
          data: "table",
          field: "segment"
        }
      }
    ],

    axes: [
      {
        ...yAxisTheme,
        formatType: "number",
        format: "~s",
        title: "y",
        domain: true,
        domainColor: (theme as any).colors.monochrome["700"],
        domainWidth: 1
      },
      {
        ...xAxisTheme,
        labelAlign: "right",
        labelAngle: -90,
        ticks: false,
        grid: true,
        title: "x"
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
      },
      {
        name: "label",
        type: "text",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "x", field: "x" },
            y: { scale: "y", field: "y" },
            dx: { value: 5 },
            dy: { value: -5 },
            fill: { value: (theme as any).colors.monochrome["700"] },
            text: { value: "FIXME" }
          }
        }
      }
    ],
    legends: [
      {
        ...legendTheme,
        fill: "colorScale"
        // title: "segment"
      }
    ]
  };
  return <ScatterplotChart spec={spec} />;
};

const ScatterplotChart = ({ spec }: { spec: any }) => {
  const [ref] = useVegaView({ spec });
  return <div ref={ref} />;
};
