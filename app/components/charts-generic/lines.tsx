import * as React from "react";
import * as vega from "vega";
import { Spec } from "vega";
import { yAxisTheme, xAxisTheme, legendTheme } from "./chart-styles";

interface Props {
  data: any;
  width: number;
  xField: string;
  yField: string;
  groupBy: string;
  groupByLabel: string;
  aggregateFunction: "sum";
}

export const Lines = ({
  data,
  width,
  xField,
  yField,
  groupBy,
  groupByLabel,
  aggregateFunction
}: Props) => {
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
          {
            type: "aggregate",
            groupby: [xField, groupBy],
            fields: [yField, yField],
            ops: [aggregateFunction, aggregateFunction],
            as: ["byTime", "byGroup"]
          }
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
          field: xField
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
          field: "byGroup"
        }
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
            groupby: groupBy
          }
        },
        // from: { data: "table" },
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
                  field: xField
                },
                y: {
                  scale: "y",
                  field: "byGroup"
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

const LinesChart = ({ spec }: { spec: any }) => {
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
        // console.log("data in lines", view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
  }, [spec]);

  return <div ref={ref} />;
};
