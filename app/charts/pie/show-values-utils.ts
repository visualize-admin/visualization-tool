import {
  useValueLabelFormatter,
  ValueLabelFormatter,
} from "@/charts/shared/show-values-utils";
import { PieFields } from "@/config-types";
import { Dimension, Measure } from "@/domain/data";

export type ShowPieValueLabelsVariables = {
  showValues: boolean;
  valueLabelFormatter: ValueLabelFormatter;
};

export const useShowPieValueLabelsVariables = (
  y: PieFields["y"],
  {
    dimensions,
    measures,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
  }
): ShowPieValueLabelsVariables => {
  const { showValues = false } = y;
  const yMeasure = measures.find((d) => d.id === y.componentId);

  if (!yMeasure) {
    throw Error(
      `No dimension <${y.componentId}> in cube! (useShowTemporalValueLabelsVariables)`
    );
  }

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: yMeasure.id,
    dimensions,
    measures,
  });

  return {
    showValues,
    valueLabelFormatter,
  };
};
