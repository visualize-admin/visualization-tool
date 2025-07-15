import { select } from "d3-selection";
import { useEffect, useMemo, useRef } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum, renderPies } from "@/charts/pie/rendering-utils";
import {
  renderPieValueLabelConnectors,
  useRenderPieValueLabelsData,
} from "@/charts/pie/show-values-utils";
import { useIsEditingAnnotation } from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderTotalValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderContainerOptions,
} from "@/charts/shared/rendering-utils";
import { useAnnotationInteractions } from "@/charts/shared/use-annotation-interactions";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";
import { useEvent } from "@/utils/use-event";

export const Pie = () => {
  const {
    bounds: { width, height },
    arcs,
    arcGenerator,
    outerRadius,
    getSegment,
    colors,
    getRenderingKey,
    getY,
  } = useChartState() as PieState;
  const isEditingAnnotation = useIsEditingAnnotation();
  const { labelFontSize, fontFamily } = useChartTheme();
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const piesRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<SVGGElement>(null);
  const connectorsRef = useRef<SVGGElement>(null);

  const renderData = useMemo(() => {
    return arcs.map((arcDatum) => {
      const y = getY(arcDatum.data);
      const segment = getSegment(arcDatum.data);

      return {
        key: getRenderingKey(arcDatum.data),
        value: y === null || isNaN(y) ? 0 : y,
        arcDatum,
        color: colors(segment),
        segment,
      } satisfies RenderDatum;
    });
  }, [arcs, getY, getSegment, getRenderingKey, colors]);

  const { onClick, onHover, onHoverOut } = useAnnotationInteractions();
  const handleHover = useEvent(
    (
      el: SVGPathElement,
      observation: Observation,
      { segment }: { segment: string }
    ) => {
      if (!isEditingAnnotation) {
        select(el).attr("stroke", "black").attr("stroke-width", 1);
      }

      onHover(observation, { segment });
    }
  );

  const handleHoverOut = useEvent((el: SVGPathElement) => {
    if (!isEditingAnnotation) {
      select(el).attr("stroke", "black").attr("stroke-width", 0);
    }
    onHoverOut();
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
        transform: `translate(${width / 2} ${height / 2})`,
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
            onClick,
            onHover: handleHover,
            onHoverOut: handleHoverOut,
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
    handleHover,
    handleHoverOut,
    height,
    labelFontSize,
    onClick,
    onHover,
    onHoverOut,
    renderData,
    transitionDuration,
    valueLabelsData,
    width,
  ]);

  return (
    <>
      <g ref={piesRef} />
      <g ref={connectorsRef} />
      <g ref={labelsRef} />
    </>
  );
};
