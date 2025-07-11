import { Annotation, ChartConfig } from "@/config-types";
import { Observation } from "@/domain/data";

export const getTargetFromObservation = (
  observation: Observation,
  { chartConfig }: { chartConfig: ChartConfig }
): Annotation["target"] => {
  const target: Annotation["target"] = { axis: undefined, segment: undefined };
  const mkTarget = (componentId: string) => {
    return {
      componentId,
      value: `${observation[componentId]}`,
    };
  };

  switch (chartConfig.chartType) {
    case "column":
    case "line":
    case "area": {
      const xComponentId = chartConfig.fields.x.componentId;
      if (xComponentId) {
        target.axis = mkTarget(xComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "bar": {
      const yComponentId = chartConfig.fields.y.componentId;
      if (yComponentId) {
        target.axis = mkTarget(yComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "scatterplot": {
      const xComponentId = chartConfig.fields.x?.componentId;
      if (xComponentId) {
        target.axis = mkTarget(xComponentId);
      }

      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "pie": {
      const segmentComponentId = chartConfig.fields.segment?.componentId;
      if (segmentComponentId) {
        target.segment = mkTarget(segmentComponentId);
      }

      break;
    }
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "map":
    case "table":
      break;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }

  return target;
};

export const matchesTarget = (
  observation: Observation,
  target: Annotation["target"]
): boolean => {
  if (
    target.axis &&
    observation[target.axis.componentId] !== target.axis.value
  ) {
    return false;
  }

  if (
    target.segment &&
    observation[target.segment.componentId] !== target.segment.value
  ) {
    return false;
  }

  return true;
};
