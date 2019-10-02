import * as React from "react";
import * as vega from "vega";
import { xAxisTheme, yAxisTheme, legendTheme } from "./chart-styles";

interface Props {
  data: any;
  width: number;
  xField: string;
  heightField: string;
  groupBy: string;
  groupByLabel: string;
  aggregateFunction: "sum"; // AggregateFunction;
}

export const Bars = ({
  data,
  width,
  xField,
  heightField,
  groupBy,
  groupByLabel,
  aggregateFunction
}: Props) => {
  const spec: vega.Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.5,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      {
        name: "table",
        values: data,
        transform: [
          {
            type: "aggregate",
            groupby: [xField, groupBy],
            fields: [heightField],
            ops: [aggregateFunction],
            as: ["sum"]
          },
          {
            type: "stack",
            groupby: [xField],
            sort: { field: groupBy },
            field: "sum"
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
        domain: { data: "table", field: xField },
        range: "width",
        padding: 0.05,
        paddingOuter: 0,
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
        range: "category",
        domain: {
          data: "table",
          field: groupBy
        }
      }
    ],

    axes: [
      yAxisTheme,
      { ...xAxisTheme, labelAngle: -90, labelAlign: "right", ticks: false }
    ],

    marks: [
      {
        type: "rect",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "x", field: xField },
            width: { scale: "x", band: 1 },
            y: { scale: "y", field: "y0" },
            y2: { scale: "y", field: "y1" }
          },
          update: {
            fill: { scale: "colorScale", field: groupBy }
          },
          hover: {
            fill: { value: "grey" }
          }
        }
      },
      {
        type: "text",
        encode: {
          enter: {
            align: { value: "center" },
            baseline: { value: "bottom" },
            fill: { value: "#333" }
          },
          update: {
            x: { scale: "x", signal: `tooltip.${xField}`, band: 0.5 },
            y: { scale: "y", signal: "tooltip.y1", offset: -2 },
            text: {
              signal: `tooltip.sum ? tooltip.${groupBy} + " " +format(tooltip.sum, '.2~r') : ''`
            },
            fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }]
          }
        }
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
  return <BarsChart spec={spec} />;
};

const BarsChart = ({ spec }: { spec: any }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const createView = async () => {
      try {
        const view = new vega.View(vega.parse(spec), {
          logLevel: vega.Warn,
          renderer: "svg",
          container: ref.current,
          hover: true
        });

        await view.runAsync();
        // console.log(view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
    // return clean-up function
  }, [spec]);

  return <div ref={ref} />;
};
