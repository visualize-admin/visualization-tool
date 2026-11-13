import { PieState } from "@/charts/pie/pie-state";
import { AxisHeightLinearChartState } from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { INSET_FOCUS_OUTLINE_CLASS_NAME } from "@/themes/focus";

// Axis title can be used in both "linear" and pie charts.
type AxisHeightTitleChartState = AxisHeightLinearChartState | PieState;

export const AxisHeightTitle = () => {
  const { axisLabelFontSize } = useChartTheme();
  const { chartType, yAxisLabel, leftAxisLabelSize, leftAxisLabelOffsetTop } =
    useChartState() as AxisHeightTitleChartState;
  // Axis title can also be used in combo line single charts.
  const { yMeasure } = useChartState() as Exclude<
    AxisHeightTitleChartState,
    { chartType: "comboLineSingle" }
  >;

  return (
    <>
      {chartType === "comboLineSingle" ? (
        <text
          y={axisLabelFontSize}
          style={{ fontSize: axisLabelFontSize, fill: "black" }}
        >
          {yAxisLabel}
        </text>
      ) : (
        <foreignObject
          className={INSET_FOCUS_OUTLINE_CLASS_NAME}
          y={leftAxisLabelOffsetTop}
          width={leftAxisLabelSize.width}
          height={leftAxisLabelSize.height}
          style={{ display: "flex" }}
        >
          <OpenMetadataPanelWrapper component={yMeasure}>
            <span style={{ fontSize: axisLabelFontSize, lineHeight: 1.5 }}>
              {yAxisLabel}
            </span>
          </OpenMetadataPanelWrapper>
        </foreignObject>
      )}
    </>
  );
};
