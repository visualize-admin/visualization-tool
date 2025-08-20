import isEqual from "lodash/isEqual";
import { useEffect, useMemo, useRef } from "react";

import {
  ChartConfig,
  DashboardFiltersConfig,
  FilterValueSingle,
  isSegmentInConfig,
} from "@/config-types";
import { useChartConfigFilters } from "@/config-utils";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { useFilterChanges } from "@/configurator/use-filter-changes";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

/**
 * Makes sure interactive filters are in sync with chart config.
 *
 * - when a filter is set in the chart config, it should be reflected at once
 *   inside the interactive filters
 *
 */
export const useSyncInteractiveFilters = (
  chartConfig: ChartConfig,
  dashboardFilters: DashboardFiltersConfig | undefined
) => {
  const { annotations, interactiveFiltersConfig } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);
  const resetCategories = useChartInteractiveFilters((d) => d.resetCategories);
  const dataFilters = useChartInteractiveFilters((d) => d.dataFilters);
  const setDataFilters = useChartInteractiveFilters((d) => d.setDataFilters);
  const updateDataFilter = useChartInteractiveFilters(
    (d) => d.updateDataFilter
  );
  const setTimeRange = useChartInteractiveFilters((d) => d.setTimeRange);
  const setCalculationType = useChartInteractiveFilters(
    (d) => d.setCalculationType
  );
  const lastOverridesRef = useRef<Record<string, string | undefined>>({});

  // Time range filter
  const presetFrom =
    interactiveFiltersConfig.timeRange.presets.from &&
    parseDate(interactiveFiltersConfig.timeRange.presets.from);
  const presetTo =
    interactiveFiltersConfig.timeRange.presets.to &&
    parseDate(interactiveFiltersConfig.timeRange.presets.to);

  const presetFromStr = presetFrom?.toString();
  const presetToStr = presetTo?.toString();
  useEffect(() => {
    // Editor time presets supersede interactive state
    if (presetFrom && presetTo) {
      setTimeRange(presetFrom, presetTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTimeRange, presetFromStr, presetToStr]);

  // Data Filters
  const componentIds = interactiveFiltersConfig.dataFilters.componentIds;
  const dashboardComponentIds = dashboardFilters?.dataFilters.componentIds;
  const newPotentialInteractiveDataFilters = useMemo(() => {
    if (componentIds) {
      // If dimension is already in use as interactive filter, use it,
      // otherwise, default to editor config filter dimension value (only
      // if dashboard filters are not set).
      return componentIds.concat(dashboardComponentIds ?? []);
    }
  }, [componentIds, dashboardComponentIds]);

  useEffect(() => {
    if (!newPotentialInteractiveDataFilters) {
      return;
    }

    const next = newPotentialInteractiveDataFilters.reduce(
      (acc, iri) => {
        const dashboardFilter = dashboardFilters?.dataFilters.filters[iri];
        if (dashboardFilter?.type === "single") {
          acc[iri] = dashboardFilter;
          return acc;
        }

        const configFilter = filters[iri];

        if (!configFilter || configFilter.type === "multi") {
          const allowed = configFilter?.values ?? {};
          const isAllowed = (val: string | number | undefined) =>
            val !== undefined ? !configFilter || !!allowed[`${val}`] : false;
          const current = dataFilters[iri];
          const override =
            interactiveFiltersConfig.dataFilters.defaultValueOverrides[iri];
          const lastOverride = lastOverridesRef.current[iri];
          const overrideChanged = override !== lastOverride;

          if (overrideChanged && override && isAllowed(override)) {
            acc[iri] = { type: "single", value: override };
            return acc;
          }

          if (current?.type === "single" && isAllowed(current.value)) {
            acc[iri] = current;
            return acc;
          }

          if (override && isAllowed(override)) {
            acc[iri] = { type: "single", value: override };
            return acc;
          }

          acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
          return acc;
        }

        const current = dataFilters[iri];

        if (current?.type === "single" && current.value !== FIELD_VALUE_NONE) {
          acc[iri] = current;
        } else if (configFilter?.type === "single") {
          acc[iri] = configFilter;
        } else {
          acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
        }

        return acc;
      },
      {} as { [key: string]: FilterValueSingle }
    );

    if (!isEqual(next, dataFilters)) {
      setDataFilters(next);
    }

    const latestOverrides: Record<string, string | undefined> = {};

    for (const iri of newPotentialInteractiveDataFilters) {
      latestOverrides[iri] =
        interactiveFiltersConfig.dataFilters.defaultValueOverrides[iri];
    }

    lastOverridesRef.current = latestOverrides;
  }, [
    dashboardFilters?.dataFilters.filters,
    dataFilters,
    filters,
    interactiveFiltersConfig.dataFilters.defaultValueOverrides,
    newPotentialInteractiveDataFilters,
    setDataFilters,
  ]);

  const changes = useFilterChanges(filters);
  useEffect(() => {
    if (changes.length !== 1) {
      return;
    }

    const [dimensionId, prev, next] = changes[0];
    if (prev?.type === "single" || next?.type === "single") {
      updateDataFilter(
        dimensionId,
        next?.type === "single" ? next.value : FIELD_VALUE_NONE
      );
    }
  }, [changes, updateDataFilter]);

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
    () => resetCategories(),
    [resetCategories, interactiveCategoriesResetTrigger]
  );

  // Calculation
  const calculationActive = interactiveFiltersConfig.calculation.active;
  const calculationType = interactiveFiltersConfig.calculation.type;

  useEffect(() => {
    if (calculationType) {
      setCalculationType(calculationType);
    }
  }, [calculationActive, calculationType, setCalculationType]);

  // Annotations
  const annotationsInitializedRef = useRef(false);
  const interactiveAnnotations = useChartInteractiveFilters(
    (d) => d.annotations
  );
  const updateAnnotation = useChartInteractiveFilters(
    (d) => d.updateAnnotation
  );
  useEffect(() => {
    if (!annotationsInitializedRef.current) {
      annotations.forEach((annotation) => {
        if (interactiveAnnotations[annotation.key] !== annotation.defaultOpen) {
          updateAnnotation(annotation.key, annotation.defaultOpen);
        }
      });
      annotationsInitializedRef.current = true;
    }
  }, [annotations, interactiveAnnotations, updateAnnotation]);
};
