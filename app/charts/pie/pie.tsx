import { arc, PieArcDatum } from "d3-shape";
import { useEffect, useMemo, useRef } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum, renderPies } from "@/charts/pie/rendering-utils";
import {
  renderPieValueLabelConnectors,
  useRenderPieValueLabelsData,
} from "@/charts/pie/show-values-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderTotalValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderContainerOptions,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";
import useEvent from "@/utils/use-event";

export const Pie = () => {
  const {
    bounds: { width, height, chartWidth, chartHeight },
    chartData,
    getPieData,
    getSegment,
    colors,
    getRenderingKey,
    getY,
  } = useChartState() as PieState;
  const { labelFontSize, fontFamily } = useChartTheme();
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const [, dispatch] = useInteraction();
  const piesRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<SVGGElement>(null);
  const connectorsRef = useRef<SVGGElement>(null);

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = maxSide;

  const xTranslate = width / 2;
  const yTranslate = height / 2;

  const renderData: RenderDatum[] = useMemo(() => {
    const arcs = getPieData(chartData);

    return arcs.map((arcDatum) => {
      const y = getY(arcDatum.data);

      return {
        key: getRenderingKey(arcDatum.data),
        value: y === null || isNaN(y) ? 0 : y,
        arcDatum,
        innerRadius,
        color: colors(getSegment(arcDatum.data)),
      };
    });
  }, [getPieData, chartData, getY, getRenderingKey, colors, getSegment]);

  const arcGenerator = arc<$FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const handleMouseEnter = useEvent((d: PieArcDatum<Observation>) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        interaction: {
          visible: true,
          d: d as unknown as Observation,
        },
      },
    });
  });

  const handleMouseLeave = useEvent(() => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  });

  const valueLabelsData = useRenderPieValueLabelsData({
    renderData,
    outerRadius,
  });

  useEffect(() => {
    const piesContainer = piesRef.current;
    const labelsContainer = labelsRef.current;
    const connectorsContainer = connectorsRef.current;

    if (piesContainer && labelsContainer && connectorsContainer) {
      const common: Pick<RenderContainerOptions, "transform" | "transition"> = {
        transform: `translate(${xTranslate} ${yTranslate})`,
        transition: {
          enable: enableTransition,
          duration: transitionDuration,
        },
      };
      renderContainer(piesContainer, {
        ...common,
        id: "pies",
        render: (g, opts) =>
          renderPies(g, renderData, {
            ...opts,
            arcGenerator,
            handleMouseEnter,
            handleMouseLeave,
          }),
      });
      renderContainer(connectorsContainer, {
        ...common,
        id: "connectors",
        render: (g, opts) =>
          renderPieValueLabelConnectors(g, valueLabelsData, {
            ...opts,
          }),
      });
      renderContainer(labelsContainer, {
        ...common,
        id: "labels",
        render: (g, opts) =>
          renderTotalValueLabels(g, valueLabelsData, {
            ...opts,
            rotate: false,
            dx: 0,
            dy: 0,
            fontFamily,
            fontSize: labelFontSize,
          }),
      });
    }
  }, [
    arcGenerator,
    enableTransition,
    fontFamily,
    handleMouseEnter,
    handleMouseLeave,
    labelFontSize,
    renderData,
    transitionDuration,
    valueLabelsData,
    xTranslate,
    yTranslate,
  ]);

  return (
    <>
      <g ref={piesRef} />
      <g ref={connectorsRef} />
      <g ref={labelsRef} />
    </>
  );
};
