import * as React from "react";
import * as vega from "vega";
import { xAxisTheme, yAxisTheme, legendTheme } from "./chart-styles";
import { useTheme } from "../../themes";

interface Props {
  data: any;
  width: number;
  xField: string;
  yField: string;
  groupByField: string;
  labelField: string;
  palette: string;
}

export const Scatterplot = ({
  data,
  width,
  xField,
  yField,
  groupByField,
  labelField,
  palette
}: Props) => {
  const theme = useTheme();
  const spec: vega.Spec = {
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
        //     keys: [groupByField],
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
        domain: { data: "table", field: xField },
        range: "width"
      },
      {
        name: "y",
        type: "linear",
        round: true,
        nice: true,
        zero: true,
        domain: { data: "table", field: yField },
        range: "height"
      },
      {
        name: "colorScale",
        type: "ordinal",
        range: { scheme: palette },
        domain: {
          data: "table",
          field: groupByField
        }
      }
    ],

    axes: [
      {
        ...yAxisTheme,
        formatType: "number",
        format: "~s",
        title: yField,
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
        title: xField
      }
    ],
    marks: [
      // {
      //   type: "line",
      //   from: { data: "table" },
      //   encode: {
      //     enter: {
      //       interpolate: { value: "monotone" },
      //       x: { scale: "x", field: xField },
      //       y: { scale: "y", field: yField },
      //       stroke: { scale: "colorScale", field: groupByField },
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
            x: { scale: "x", field: xField },
            y: { scale: "y", field: yField },
            shape: { value: "circle" },
            strokeWidth: { value: 0 },
            opacity: { value: 0.6 },
            stroke: { value: "transparent" },
            fill: { scale: "colorScale", field: groupByField } //{ value: vega.scheme(palette)[0] }
          }
        }
      },
      {
        name: "label",
        type: "text",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "x", field: xField },
            y: { scale: "y", field: yField },
            dx: { value: 5 },
            dy: { value: -5 },
            fill: { value: (theme as any).colors.monochrome["700"] },
            text: { field: labelField }
          }
        }
      }
    ],
    legends: [
      {
        ...legendTheme,
        fill: "colorScale"
        // title: groupByField
      }
    ]
  };
  return <ScatterplotChart spec={spec} />;
};

const ScatterplotChart = ({ spec }: { spec: any }) => {
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
        console.table(view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
    // return clean-up function
  }, [spec]);

  return <div ref={ref} />;
};
