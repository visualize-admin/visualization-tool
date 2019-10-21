import * as React from "react";
import * as vega from "vega";
import { xAxisTheme, yAxisTheme } from "./chart-styles";
import { useTheme } from "../../themes";

interface Props {
  data: any;
  width: number;
  xField: string;
  yField: string;
}

export const Scatterplot = ({ data, width, xField, yField }: Props) => {
  // FIXME: Use hook to get the theme from ThemeProvider.
  const theme = useTheme();
  const spec: vega.Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.5,
    padding: 5,

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      {
        name: "table",
        values: data
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
      }
    ],

    axes: [
      { ...yAxisTheme, formatType: "number", format: "~s", title: yField },
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
      {
        name: "marks",
        type: "symbol",
        from: { data: "table" },
        encode: {
          update: {
            x: { scale: "x", field: xField },
            y: { scale: "y", field: yField },
            shape: { value: "circle" },
            strokeWidth: { value: 0 },
            opacity: { value: 0.6 },
            stroke: { value: "transparent" },
            fill: { value: (theme.colors.primary as any).base } // FIXME
          }
        }
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
        // console.log("vegadata", view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
    // return clean-up function
  }, [spec]);

  return <div ref={ref} />;
};
