import { ScaleType } from "@/graphql/query-hooks";

export const shouldStartAtZero = (scaleType: ScaleType | undefined) => {
  return scaleType === ScaleType.Ratio;
};

export const getMaybeDynamicMinYScaleValue = (
  scaleType: ScaleType | undefined,
  minValue: number = 0
) => {
  return shouldStartAtZero(scaleType) ? Math.min(0, minValue) : minValue;
};
