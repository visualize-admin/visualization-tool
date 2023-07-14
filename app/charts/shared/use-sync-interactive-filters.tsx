import { useEffect, useMemo } from "react";

import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import {
  ChartConfig,
  FilterValueSingle,
  isSegmentInConfig,
} from "@/config-types";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import useFilterChanges from "@/configurator/use-filter-changes";

/**
 * Makes sure interactive filters are in sync with chart config.
 *
 * - when a filter is set in the chart config, it should be reflected at once
 *   inside the interactive filters
 *
 */
const useSyncInteractiveFilters = (chartConfig: ChartConfig) => {
  const [IFstate, dispatch] = useInteractiveFilters();
  const { interactiveFiltersConfig } = chartConfig;

  // Time range filter
  const presetFrom =
    interactiveFiltersConfig?.timeRange.presets.from &&
    parseDate(interactiveFiltersConfig?.timeRange.presets.from);
  const presetTo =
    interactiveFiltersConfig?.timeRange.presets.to &&
    parseDate(interactiveFiltersConfig?.timeRange.presets.to);

  const presetFromStr = presetFrom?.toString();
  const presetToStr = presetTo?.toString();
  useEffect(() => {
    // Editor time presets supersede interactive state
    if (presetFrom && presetTo) {
      dispatch({
        type: "SET_TIME_RANGE_FILTER",
        value: [presetFrom, presetTo],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, presetFromStr, presetToStr]);

  // Data Filters
  const componentIris = interactiveFiltersConfig?.dataFilters.componentIris;
  useEffect(() => {
    if (componentIris) {
      // If dimension is already in use as interactive filter, use it,
      // otherwise, default to editor config filter dimension value.
      const newInteractiveDataFilters = componentIris.reduce<{
        [key: string]: FilterValueSingle;
      }>((obj, iri) => {
        const configFilter = chartConfig.filters[iri];

        if (Object.keys(IFstate.dataFilters).includes(iri)) {
          obj[iri] = IFstate.dataFilters[iri];
        } else if (configFilter?.type === "single") {
          obj[iri] = configFilter;
        }

        return obj;
      }, {});

      dispatch({ type: "SET_DATA_FILTER", value: newInteractiveDataFilters });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentIris, dispatch]);

  const changes = useFilterChanges(chartConfig.filters);
  useEffect(() => {
    if (changes.length !== 1) {
      return;
    }

    const [dimensionIri, prev, next] = changes[0];
    if (prev?.type === "single" || next?.type === "single") {
      dispatch({
        type: "UPDATE_DATA_FILTER",
        value:
          next?.type === "single" && next?.value
            ? {
                dimensionIri,
                dimensionValueIri: next.value,
              }
            : {
                dimensionIri,
                dimensionValueIri: FIELD_VALUE_NONE,
              },
      });
    }
  }, [changes, dispatch]);

  // Maybe it should be more generic?
  const interactiveCategoriesResetTrigger = useMemo(
    () => (isSegmentInConfig(chartConfig) ? chartConfig.fields.segment : null),
    [chartConfig]
  );

  // Interactive legend
  // Reset categories to avoid categories with the same
  // name to persist as filters across different dimensions
  // i.e. Jura as forest zone != Jura as canton.
  useEffect(
    () => dispatch({ type: "RESET_INTERACTIVE_CATEGORIES" }),
    [dispatch, interactiveCategoriesResetTrigger]
  );
};

export default useSyncInteractiveFilters;
