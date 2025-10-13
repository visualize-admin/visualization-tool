import { useEffect, useState } from "react";

import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { getTextSize, GetTextSizeOptions } from "@/utils/get-text-size";

export const TITLE_V_PADDING = 4;
export const TITLE_H_PADDING = 8;

const getAxisTitleSize = (
  text: string,
  options: Pick<GetTextSizeOptions, "width" | "fontSize">
) => {
  return getTextSize(text, {
    ...options,
    fontWeight: 400,
    paddingTop: TITLE_V_PADDING,
    paddingLeft: TITLE_H_PADDING,
    paddingRight: TITLE_H_PADDING,
    paddingBottom: TITLE_V_PADDING,
  });
};

export const useAxisTitleSize = (
  text: string,
  { width }: Pick<GetTextSizeOptions, "width">
) => {
  const { axisLabelFontSize } = useChartTheme();
  const [size, setSize] = useState<DOMRect>(() => ({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => "",
  }));

  useEffect(() => {
    setSize(getAxisTitleSize(text, { width, fontSize: axisLabelFontSize }));
  }, [axisLabelFontSize, text, width]);

  return size;
};

export const SINGLE_LINE_AXIS_LABEL_HEIGHT = getAxisTitleSize("M", {
  width: 100,
  fontSize: 14,
}).height;
