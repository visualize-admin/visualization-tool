import { TooltipValue } from "@/charts/shared/interaction/tooltip";

export const getAnnotationPosition = ({
  chartType,
  multipleSegments,
  xAnchor,
  yAnchor,
  value,
}: {
  chartType: "area" | "bar" | "column" | "line" | "pie" | "scatterplot";
  multipleSegments: boolean;
  xAnchor: number;
  yAnchor: number | undefined;
  value: TooltipValue | undefined;
}) => {
  const axisOffset = multipleSegments ? 0 : -16;

  switch (chartType) {
    case "area":
    case "line": {
      const y = value?.axisOffset ?? yAnchor;

      return {
        x: xAnchor,
        y,
      };
    }
    case "bar":
      return {
        x: (value?.axisOffset ?? xAnchor) + axisOffset,
        y: yAnchor,
      };
    case "column": {
      const y = value?.axisOffset ?? yAnchor;

      return {
        x: xAnchor,
        y: y !== undefined ? y + axisOffset : y,
      };
    }
    case "pie":
    case "scatterplot":
      return {
        x: xAnchor,
        y: yAnchor,
      };
    default:
      const _exhaustiveCheck: never = chartType;
      return _exhaustiveCheck;
  }
};
