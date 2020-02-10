import * as React from "react";
import { Spec } from "vega";
import { LineFields } from "../../../domain";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation,
  getDimensionLabel
} from "../../../domain/data";
import { useVegaView } from "../../../lib/use-vega";
import { legendTheme, useChartTheme } from "../use-chart-theme";
import { useTheme } from "../../../themes";

interface Props {
  data: Observation[];
  width: number;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: LineFields;
}

export const Lines = ({ data, width, dimensions, measures, fields }: Props) => {
  const { labelColor, domainColor, gridColor, fontFamily } = useChartTheme();
  const theme = useTheme();

  const fieldValues = new Set([fields.x.componentIri]);
  const unmappedFields: [string, DimensionWithMeta][] = Object.entries<
    | {
        componentIri: string;
      }
    | undefined
  >(fields).flatMap(([key, fieldValue]) => {
    if (!fieldValue) {
      return [];
    }
    const mbDim = dimensions.find(
      d => d.component.iri.value === fieldValue.componentIri
    );
    return !fieldValues.has(fieldValue.componentIri) && mbDim
      ? [[key, mbDim]]
      : [];
  });
  const unmappedFieldKeys = unmappedFields.map(([key, value]) => key);

  const yFieldLabel = getDimensionLabel(
    measures.find(d => d.component.iri.value === fields.y.componentIri)!
  );

  const spec: Spec = !fields.segment
    ? {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        width,
        height: width * 0.4,
        padding: { left: 16, right: 16, top: 16, bottom: 16 },
        autosize: { type: "fit-x", contains: "padding" },

        // title: { text: title, orient: "none", align: "left", fontSize: 16 },

        data: [
          {
            name: "table",
            values: data,
            transform: [
              { type: "filter", expr: "isValid(datum.y)" },
              {
                type: "formula",
                as: "date",
                expr: `timeParse(datum.x, "%Y")`
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
            nice: true,
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
              field: "y"
            }
          }
        ],
        axes: [
          {
            orient: "left",
            scale: "y",
            bandPosition: 0.5,
            domain: false,
            grid: true,
            gridColor: gridColor,
            labelFont: fontFamily,
            labelColor: labelColor,
            labelFontSize: 12,
            labelPadding: 8,
            ticks: false,
            tickCount: 5,
            formatType: "number",
            format: ",.2~f",
            offset: 0,
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
            bandPosition: 1,
            domain: true,
            domainColor,
            domainWidth: 1,
            grid: false,
            labelColor: labelColor,
            labelFont: fontFamily,
            titleFont: fontFamily,
            titleColor: labelColor,
            labelFontSize: 12,
            labelAngle: 0,
            labelBaseline: "middle",
            labelPadding: 8,
            ticks: true,
            tickCount: 5,
            tickColor: domainColor,
            formatType: "time",
            format: "%Y"
          }
        ],

        marks: [
          {
            type: "line",
            from: {
              data: "table"
            },
            encode: {
              enter: {
                x: {
                  scale: "x",
                  field: "date"
                },
                y: {
                  scale: "y",
                  field: "y"
                },
                stroke: {
                  value: theme.colors.primary
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
    : {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        width,
        height: width * 0.4,
        padding: { left: 16, right: 16, top: 16, bottom: 16 },
        autosize: { type: "fit-x", contains: "padding" },

        // title: { text: title, orient: "none", align: "left", fontSize: 16 },

        data: [
          {
            name: "table",
            values: data,
            transform: [
              // {
              //   type: "aggregate",
              //   groupby: [xField, groupBy],
              //   fields: [yField, yField],
              //   ops: [aggregateFunction, aggregateFunction],
              //   as: ["byTime", "byGroup"]
              // },
              { type: "filter", expr: "isValid(datum.y)" },
              {
                type: "formula",
                as: "date",
                expr: `timeParse(datum.x, "%Y")`
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
            nice: true,
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
              field: "y"
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
          {
            orient: "left",
            scale: "y",
            bandPosition: 0.5,
            domain: false,
            grid: true,
            gridColor: gridColor,
            labelFont: fontFamily,
            labelColor: labelColor,
            labelFontSize: 12,
            labelPadding: 8,
            ticks: false,
            tickCount: 5,
            formatType: "number",
            format: ",.2~f",
            offset: 0,
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
            bandPosition: 1,
            domain: true,
            domainColor,
            domainWidth: 1,
            grid: false,
            labelColor: labelColor,
            labelFont: fontFamily,
            titleFont: fontFamily,
            titleColor: labelColor,
            labelFontSize: 12,
            labelAngle: 0,
            labelBaseline: "middle",
            labelPadding: 8,
            ticks: true,
            tickCount: 5,
            tickColor: domainColor,
            formatType: "time",
            format: "%Y"
          }
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
                type: "line",
                from: {
                  data: "series"
                },
                encode: {
                  enter: {
                    x: {
                      scale: "x",
                      field: "date"
                    },
                    y: {
                      scale: "y",
                      field: "y"
                    },
                    stroke: {
                      scale: "colorScale",
                      field: "segment"
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

const LinesChart = ({ spec }: { spec: Spec }) => {
  const [ref] = useVegaView({ spec });

  return <div ref={ref} />;
};
