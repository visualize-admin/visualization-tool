import * as React from "react";
import { Spec } from "vega";
import { ColumnFields, GenericField } from "../../domain";
import {
  DimensionWithMeta,
  getDimensionLabel,
  MeasureWithMeta,
  Observation
} from "../../domain/data";
import { useVegaView } from "../../lib/use-vega";
import {
  getLabelAngle,
  getLabelPosition,
  legendTheme,
  useChartTheme
} from "./chart-styles";
import { useTheme } from "../../themes";

interface Props {
  data: Observation[];
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
  const { labelColor, domainColor, gridColor, fontFamily } = useChartTheme();
  const theme = useTheme();

  const yFieldLabel = getDimensionLabel(
    measures.find(d => d.component.iri.value === fields.y.componentIri)!
  );
  const fieldValues = new Set([fields.x.componentIri, fields.y.componentIri]);
  const unmappedFields = Object.entries(fields).flatMap(([key, field]) => {
    const mbDim = dimensions.find(
      d => d.component.iri.value === (field as GenericField).componentIri
    );

    return !fieldValues.has((field as GenericField).componentIri) && mbDim
      ? [[key, mbDim]]
      : [];
  });
  const nbXLabels = new Set(data.map(d => d.x)).size;
  // SIMPLE ------------------------------------------------------------------------------//
  const simpleSpec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: { left: 16, right: 16, top: 16, bottom: 16 },

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      {
        name: "table",
        values: data
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
        domain: { data: "table", field: "y" },
        nice: true,
        range: "height"
      }
    ],

    axes: [
      {
        orient: "left",
        scale: "y",
        bandPosition: 0.5,
        domain: false,
        grid: true,
        gridColor,
        labelFont: fontFamily,
        labelColor: labelColor,
        labelFontSize: 12,
        labelPadding: 8,
        ticks: false,
        tickCount: 5,
        formatType: "number",
        format: ",.2~f",
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
        labelBaseline: "middle",
        labelPadding: 8,
        tickColor: domainColor,
        labelAngle: getLabelAngle(nbXLabels),
        labelAlign: getLabelPosition(nbXLabels),
        ticks: true,
        tickBand: "center"
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
            y: { scale: "y", field: "y" },
            y2: { scale: "y", value: 0 }
          },
          update: {
            fillOpacity: { value: 0.9 },
            fill: { value: theme.colors.primary }
          },
          hover: {
            fillOpacity: { value: 1 }
          }
        }
      }
    ]
  };

  // STACKED ------------------------------------------------------------------------------//
  const stackedSpec: Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: width * 0.4,
    padding: { left: 16, right: 16, top: 16, bottom: 16 },

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      { name: "labels", values: [{ key: "xField", value: "X FIELD" }] },
      {
        name: "table",
        values: data,
        transform: [
          { type: "filter", expr: "isValid(datum.y)" },
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
      {
        orient: "left",
        scale: "y",
        // offset: 0,
        bandPosition: 0.5,
        domain: false,
        grid: true,
        gridColor,
        labelFont: fontFamily,
        labelColor: labelColor,
        labelFontSize: 12,
        labelPadding: 8,
        ticks: false,
        tickCount: 5,
        formatType: "number",
        format: ",.2~f",
        title: yFieldLabel,
        titleFont: fontFamily,
        titleColor: labelColor,
        titleY: -16,
        titleX: 0,
        titlePadding: 16,
        titleAngle: 0,
        titleAnchor: "start",
        titleAlign: "left"
        // titleBaseline: "bottom"
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
        labelBaseline: "middle",
        labelPadding: 8,
        tickColor: domainColor,
        labelAngle: getLabelAngle(nbXLabels),
        labelAlign: getLabelPosition(nbXLabels),
        ticks: true,
        tickBand: "center"
        // title: xFieldLabel
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
            fillOpacity: { value: 1 },
            fill: { scale: "colorScale", field: "segment" }
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
      //       x: { scale: "x", signal: `tooltip["x"]`, band: 0.5 },
      //       y: { scale: "y", signal: "tooltip.y1", offset: -2 },
      //       text: {
      //         signal: `tooltip.y ? tooltip.tooltipLabel + " " +format(tooltip.y, ',.2~f') : ''`
      //       },
      //       fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }]
      //     }
      //   }
      // }
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
    padding: { left: 16, right: 16, top: 16, bottom: 16 },

    autosize: { type: "fit-x", contains: "padding" },

    data: [
      {
        name: "table",
        values: data,
        transform: [{ type: "filter", expr: "isValid(datum.y)" }]
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
        orient: "left",
        scale: "yscale",
        bandPosition: 0.5,
        domain: false,
        grid: true,
        gridColor,
        labelFont: fontFamily,
        labelColor: labelColor,
        labelFontSize: 12,
        labelPadding: 8,
        ticks: false,
        tickCount: 5,
        formatType: "number",
        format: ",.2~f",
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
        scale: "xscale",
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
        labelBaseline: "middle",
        labelPadding: 8,
        tickColor: domainColor,
        labelAngle: getLabelAngle(nbXLabels),
        labelAlign: getLabelPosition(nbXLabels),
        ticks: true,
        tickBand: "center",
        zindex: 1

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
        !fields.segment
          ? simpleSpec
          : fields.segment.type === "stacked"
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
