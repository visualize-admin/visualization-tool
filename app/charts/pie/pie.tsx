import { arc } from "d3-shape";
import { useEffect, useMemo, useRef, useState } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum, renderPies } from "@/charts/pie/rendering-utils";
import {
  renderPieValueLabelConnectors,
  useRenderPieValueLabelsData,
} from "@/charts/pie/show-values-utils";
import {
  useGetAnnotationRenderState,
  useIsEditingAnnotation,
} from "@/charts/shared/annotation-utils";
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
import { useEvent } from "@/utils/use-event";

export const Pie = () => {
  const {
    bounds: { width, height, chartWidth, chartHeight },
    chartData,
    getPieData,
    segmentDimension,
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

  const [hoveredObservation, setHoveredObservation] =
    useState<Observation | null>(null);

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = maxSide;

  const xTranslate = width / 2;
  const yTranslate = height / 2;

  const isEditingAnnotation = useIsEditingAnnotation();
  const getAnnotationRenderState = useGetAnnotationRenderState();

  const renderData = useMemo(() => {
    const arcs = getPieData(chartData);

    return arcs.map((arcDatum) => {
      const y = getY(arcDatum.data);
      const segment = getSegment(arcDatum.data);
      const { focused } = getAnnotationRenderState(arcDatum.data, {
        axisComponentId: segmentDimension?.id ?? "",
        axisValue: segment,
      });

      return {
        key: getRenderingKey(arcDatum.data),
        value: y === null || isNaN(y) ? 0 : y,
        arcDatum,
        color: colors(segment),
        focused,
        hovered: hoveredObservation === arcDatum.data,
      } satisfies RenderDatum;
    });
  }, [
    getPieData,
    chartData,
    getY,
    getSegment,
    getAnnotationRenderState,
    segmentDimension?.id,
    getRenderingKey,
    colors,
    hoveredObservation,
  ]);

  const arcGenerator = arc<$FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const handleMouseEnter = useEvent((observation: Observation) => {
    setHoveredObservation(observation);
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        type: isEditingAnnotation ? "focus" : "tooltip",
        visible: true,
        observation,
      },
    });
  });

  const handleMouseLeave = useEvent(() => {
    setHoveredObservation(null);
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
            isEditingAnnotation,
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
            strokeWidth: 8,
          }),
      });
    }
  }, [
    arcGenerator,
    enableTransition,
    fontFamily,
    handleMouseEnter,
    handleMouseLeave,
    isEditingAnnotation,
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
