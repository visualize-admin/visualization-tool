import * as React from "react";
import * as vega from "vega";

interface VegaSpecs extends vega.Spec {
  data: any;
}

interface Props {
  data: any;
  width: number;
  timeField: string;
  yField: string;
  groupBy: string;
  groupByLabel: string;
  aggregateFunction: "sum";
}

export const Areas = ({
  data,
  width,
  timeField,
  yField,
  groupBy,
  groupByLabel,
  aggregateFunction
}: Props) => {
  const spec: VegaSpecs = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width,
    height: width * 0.5,
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
            groupby: [timeField, groupBy],
            fields: [yField],
            ops: ["sum"],
            as: ["sumByTime"]
          },
          { type: "stack", field: "sumByTime", groupby: [timeField] }
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
          field: timeField
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
        name: "color",
        type: "ordinal",
        range: "category",
        domain: {
          data: "table",
          field: groupBy
        }
      }
    ],

    axes: [
      {
        orient: "bottom",
        scale: "x",
        format: "%Y"
      },
      {
        orient: "left",
        scale: "y"
      }
    ],

    marks: [
      {
        type: "group",
        from: {
          facet: {
            name: "series",
            data: "table",
            groupby: [groupBy]
          }
        },
        marks: [
          {
            type: "area",
            from: { data: "series" },
            encode: {
              enter: {
                x: { scale: "x", field: timeField },
                y: { scale: "y", field: "y0" },
                y2: { scale: "y", field: "y1" },
                fill: { scale: "color", field: groupBy }
              },
              update: {
                fillOpacity: { value: 1 }
              },
              hover: {
                fillOpacity: { value: 0.5 }
              }
            }
          }
        ]
      }
    ],

    legends: [
      {
        fill: "color",
        title: groupByLabel,
        orient: "bottom",
        direction: "vertical",
        columns: 3
      }
    ]
  };

  return <AreasChart spec={spec} />;
};

const AreasChart = ({ spec }: { spec: vega.Spec }) => {
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
        console.log("data in areas", view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
  }, [spec]);

  return <div ref={ref} />;
};
