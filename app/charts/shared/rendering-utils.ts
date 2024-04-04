import { select, Selection } from "d3-selection";
import { Transition } from "d3-transition";
import React from "react";

import {
  AnimationField,
  Filters,
  InteractiveFiltersConfig,
} from "@/configurator";
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
  interactiveFiltersConfig: InteractiveFiltersConfig,
  animationField: AnimationField | undefined
) => {
  const filterableDimensionKeys = React.useMemo(() => {
    // Remove single filters from the rendering key, as we want to be able
    // to animate them.
    const keysToRemove = Object.entries(filters)
      .filter((d) => d[1].type === "single")
      .map((d) => d[0]);

    if (interactiveFiltersConfig) {
      const { dataFilters, legend } = interactiveFiltersConfig;

      if (dataFilters.componentIris.length > 0) {
        keysToRemove.push(...dataFilters.componentIris);
      }

      if (legend.componentIri) {
        keysToRemove.push(legend.componentIri);
      }
    }

    if (animationField) {
      keysToRemove.push(animationField.componentIri);
    }

    return dimensions
      .filter((d) => !isStandardErrorDimension(d))
      .map((d) => d.iri)
      .filter((d) => !keysToRemove.includes(d));
  }, [dimensions, filters, interactiveFiltersConfig, animationField]);

  /** Optionally provide an option to pass a segment to the key.
   * This is useful for stacked charts, where we can't easily
   * access the segment value from the data.
   */
  const getRenderingKey = React.useCallback(
    (d: Observation, segment: string = "") => {
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

type RenderContainerOptions = {
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
