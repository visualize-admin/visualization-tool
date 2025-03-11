import { area } from "d3-shape";
import { useEffect, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { RenderAreaDatum, renderAreas } from "@/charts/area/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderTotalValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderContainerOptions,
} from "@/charts/shared/rendering-utils";
import { useRenderTemporalValueLabelsData } from "@/charts/shared/show-values-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTransitionStore } from "@/stores/transition";

export const Areas = () => {
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as AreasState;
  const { margins } = bounds;
  const { labelFontSize, fontFamily } = useChartTheme();
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const areaGenerator = area<$FixMe>()
    .defined((d) => d[0] !== null && d[1] !== null)
    .x((d) => xScale(getX(d.data)))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));
  const renderData: RenderAreaDatum[] = useMemo(() => {
    return series.map((d) => {
      return {
        key: d.key,
        d: areaGenerator(d) as string,
        dEmpty: areaGenerator(
          d.map((d) => {
            const dNew = { ...d };
            dNew[1] = d[0];

            return dNew;
          })
        ) as string,
        color: colors(d.key),
      };
    });
  }, [series, areaGenerator, colors]);

  const valueLabelsData = useRenderTemporalValueLabelsData();

  useEffect(() => {
    const g = ref.current;

    if (g) {
      const common: Pick<
        RenderContainerOptions,
        "id" | "transform" | "transition"
      > = {
        id: "areas",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: {
          enable: enableTransition,
          duration: transitionDuration,
        },
      };
      renderContainer(g, {
        ...common,
        render: (g, opts) => renderAreas(g, renderData, opts),
      });
      renderContainer(g, {
        ...common,
        render: (g, opts) =>
          renderTotalValueLabels(g, valueLabelsData, {
            ...opts,
            rotate: false,
            fontFamily,
            fontSize: labelFontSize,
          }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
    valueLabelsData,
    labelFontSize,
    fontFamily,
  ]);

  return <g ref={ref} />;
};
