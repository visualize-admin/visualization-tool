import { select, Selection } from "d3-selection";
import { Transition } from "d3-transition";
import { useCallback, useMemo } from "react";

import { AnimationField, Filters } from "@/configurator";
import {
  Component,
  isStandardErrorDimension,
  Observation,
} from "@/domain/data";
import { TransitionStore } from "@/stores/transition";

/** Use to create a unique key for rendering the shapes.
 * It's important to animate them correctly when using d3.
 */
export const useRenderingKeyVariable = (
  dimensions: Component[],
  filters: Filters,
  animationField: AnimationField | undefined
) => {
  const filterableDimensionKeys = useMemo(() => {
    // Remove single filters from the rendering key, as we want to be able
    // to animate them.
    const keysToRemove = Object.entries(filters)
      .filter((d) => d[1].type === "single")
      .map((d) => d[0]);

    if (animationField) {
      keysToRemove.push(animationField.componentId);
    }

    return dimensions
      .filter((d) => !isStandardErrorDimension(d))
      .map((d) => d.id)
      .filter((d) => !keysToRemove.includes(d));
  }, [dimensions, filters, animationField]);

  /** Optionally provide an option to pass a segment to the key.
   * This is useful for stacked charts, where we can't easily
   * access the segment value from the data.
   */
  const getRenderingKey = useCallback(
    (d: Observation, segment = "") => {
      return filterableDimensionKeys
        .map((key) => d[key])
        .concat(segment)
        .join("");
    },
    [filterableDimensionKeys]
  );

  return getRenderingKey;
};

export type RenderOptions = {
  transition: Pick<TransitionStore, "enable" | "duration">;
};

export type RenderContainerOptions = {
  id: string;
  transform: string;
  transition: RenderOptions["transition"];
  render: (
    g: Selection<SVGGElement, null, SVGGElement, unknown>,
    parentRenderOptions: RenderOptions
  ) => void;
  renderUpdate?: (
    g: Selection<SVGGElement, null, SVGGElement, unknown>,
    parentRenderOptions: RenderOptions
  ) => void;
};

export function renderContainer(
  g: SVGGElement,
  options: RenderContainerOptions
) {
  const { id, transform, render, renderUpdate, transition } = options;

  return select(g)
    .selectAll<SVGGElement, null>(`#${id}`)
    .data([null])
    .join(
      (enter) => {
        const g = enter.append("g").attr("id", id).attr("transform", transform);
        render(g, options);
        return g;
      },
      (update) => {
        const g = maybeTransition(update, {
          // We need to use a unique name for the transition, otherwise there could
          // be conflicts with other transitions.
          name: `${id}-transform`,
          transition,
          s: (g) => g.attr("transform", transform),
          t: (g) => g.attr("transform", transform),
        });
        (renderUpdate ?? render)(g, options);
        return g;
      },
      (exit) => {
        return exit.remove();
      }
    );
}

type MaybeTransitionOptions<S extends AnySelection, T extends AnyTransition> = {
  name?: string;
  transition: Pick<TransitionStore, "enable" | "duration">;
  /** Render selection. */
  s: (g: S) => S;
  /** Render transition. If empty, defaults to `s`. */
  t?: (g: T) => T;
};

/** Use to conditionally call a transition if required. */
export function maybeTransition<
  S extends AnySelection,
  T extends AnyTransition,
>(g: S, options: MaybeTransitionOptions<S, T>) {
  const { name, transition, s, t } = options;

  return transition.enable
    ? // If transition render is not defined, we use the selection render.
      // (as selection methods can be called with a transition, we cast the type here
      // to avoid a type error).
      (t ?? s)(
        g.transition(name).duration(transition.duration) as any
      ).selection()
    : s(g);
}

type AnySelection = Selection<any, any, any, any>;
type AnyTransition = Transition<any, any, any, any>;

const ERROR_WHISKER_SIZE = 1;
const ERROR_WHISKER_MIDDLE_CIRCLE_RADIUS = 3.5;

export type RenderVerticalWhiskerDatum = {
  key: string;
  x: number;
  y: number;
  y1: number;
  y2: number;
  width: number;
  fill?: string;
  renderMiddleCircle?: boolean;
};

export type RenderHorizontalWhiskerDatum = {
  key: string;
  y: number;
  x1: number;
  x2: number;
  height: number;
  fill?: string;
  renderMiddleCircle?: boolean;
};

export const renderVerticalWhiskers = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderVerticalWhiskerDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

  g.selectAll<SVGGElement, RenderVerticalWhiskerDatum>("g")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("opacity", 0)
          .call((g) =>
            g
              .append("rect")
              .attr("class", "top")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y2)
              .attr("width", (d) => d.width)
              .attr("height", ERROR_WHISKER_SIZE)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "middle")
              .attr("x", (d) => d.x + (d.width - ERROR_WHISKER_SIZE) / 2)
              .attr("y", (d) => d.y2)
              .attr("width", ERROR_WHISKER_SIZE)
              .attr("height", (d) => Math.max(0, d.y1 - d.y2))
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "bottom")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y1)
              .attr("width", (d) => d.width)
              .attr("height", ERROR_WHISKER_SIZE)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .filter((d) => d.renderMiddleCircle ?? false)
              .append("circle")
              .attr("class", "middle-circle")
              .attr("cx", (d) => d.x + d.width / 2)
              .attr("cy", (d) => d.y)
              .attr("r", ERROR_WHISKER_MIDDLE_CIRCLE_RADIUS)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((enter) =>
            maybeTransition(enter, {
              s: (g) => g.attr("opacity", 1),
              transition,
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("opacity", 1)
              .call((g) =>
                g
                  .select(".top")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y2)
                  .attr("width", (d) => d.width)
                  .attr("fill", (d) => d.fill ?? "black")
              )
              .call((g) =>
                g
                  .select(".middle")
                  .attr("x", (d) => d.x + (d.width - ERROR_WHISKER_SIZE) / 2)
                  .attr("y", (d) => d.y2)
                  .attr("height", (d) => Math.max(0, d.y1 - d.y2))
                  .attr("fill", (d) => d.fill ?? "black")
              )
              .call((g) =>
                g
                  .select(".bottom")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y1)
                  .attr("width", (d) => d.width)
                  .attr("fill", (d) => d.fill ?? "black")
              )
              .call((g) =>
                g
                  .select(".middle-circle")
                  .attr("cx", (d) => d.x + d.width / 2)
                  .attr("cy", (d) => d.y)
                  .attr("r", ERROR_WHISKER_MIDDLE_CIRCLE_RADIUS)
                  .attr("fill", (d) => d.fill ?? "black")
                  .attr("stroke", "none")
              ),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("opacity", 0).remove(),
        })
    );
};

export const renderHorizontalWhisker = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderHorizontalWhiskerDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

  g.selectAll<SVGGElement, RenderHorizontalWhiskerDatum>("g")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("opacity", 0)
          .call((g) =>
            g
              .append("rect")
              .attr("class", "right")
              .attr("y", (d) => d.y)
              .attr("x", (d) => d.x2)
              .attr("width", ERROR_WHISKER_SIZE)
              .attr("height", (d) => d.height)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "middle")
              .attr("y", (d) => d.y + (d.height - ERROR_WHISKER_SIZE) / 2)
              .attr("x", (d) => d.x1)
              .attr("width", (d) => Math.abs(Math.min(0, d.x1 - d.x2)))
              .attr("height", ERROR_WHISKER_SIZE)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "left")
              .attr("y", (d) => d.y)
              .attr("x", (d) => d.x1)
              .attr("width", ERROR_WHISKER_SIZE)
              .attr("height", (d) => d.height)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((enter) =>
            maybeTransition(enter, {
              s: (g) => g.attr("opacity", 1),
              transition,
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("opacity", 1)
              .call((g) =>
                g
                  .select(".right")
                  .attr("y", (d) => d.y)
                  .attr("x", (d) => d.x2)
                  .attr("height", (d) => d.height)
                  .attr("fill", (d) => d.fill ?? "black")
              )
              .call((g) =>
                g
                  .select(".middle")
                  .attr("y", (d) => d.y + (d.height - ERROR_WHISKER_SIZE) / 2)
                  .attr("x", (d) => d.x1)
                  .attr("width", (d) => Math.abs(Math.min(0, d.x1 - d.x2)))
                  .attr("fill", (d) => d.fill ?? "black")
              )
              .call((g) =>
                g
                  .select(".left")
                  .attr("y", (d) => d.y)
                  .attr("x", (d) => d.x1)
                  .attr("height", (d) => d.height)
                  .attr("fill", (d) => d.fill ?? "black")
              ),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("opacity", 0).remove(),
        })
    );
};

export const toggleFocusBorder = <T extends { focused?: boolean }>(
  s: Selection<SVGGElement, T, SVGGElement, unknown>
) => {
  s.attr("stroke", (d) => (d.focused ? ANNOTATION_FOCUS_COLOR : "none")).attr(
    "stroke-width",
    (d) => (d.focused ? ANNOTATION_FOCUS_WIDTH : 0)
  );
};

export const ANNOTATION_FOCUS_COLOR = "#A332DE";
export const ANNOTATION_FOCUS_WIDTH = 4;
