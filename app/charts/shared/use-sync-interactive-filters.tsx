import isEqual from "lodash/isEqual";
import { useEffect, useMemo, useRef } from "react";

import {
  ChartConfig,
  DashboardFiltersConfig,
  FilterValue,
  isSegmentInConfig,
} from "@/config-types";
import { useChartConfigFilters } from "@/config-utils";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { useFilterChanges } from "@/configurator/use-filter-changes";
import {
  useChartInteractiveFilters,
  useInteractiveFiltersGetState,
} from "@/stores/interactive-filters";

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
  const filters = useChartConfigFilters(chartConfig, { joined: true });
  const resetCategories = useChartInteractiveFilters((d) => d.resetCategories);
  const setDataFilters = useChartInteractiveFilters((d) => d.setDataFilters);
  const getInteractiveFiltersState = useInteractiveFiltersGetState();
  const updateDataFilter = useChartInteractiveFilters(
    (d) => d.updateDataFilter
  );
  const setTimeRange = useChartInteractiveFilters((d) => d.setTimeRange);
  const setCalculationType = useChartInteractiveFilters(
    (d) => d.setCalculationType
  );
  const lastOverridesRef = useRef<
    Record<string, string[] | string | undefined>
  >({});

  const isFirstRunRef = useRef(true);

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

    const currentDataFilters = getInteractiveFiltersState().dataFilters;
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
          const current = currentDataFilters[iri];
          const override =
            interactiveFiltersConfig.dataFilters.defaultValueOverrides[iri];
          const lastOverride = lastOverridesRef.current[iri];

          const overrideChanged =
            isFirstRunRef.current || !isEqual(override, lastOverride);

          if (overrideChanged && override && Array.isArray(override)) {
            const validOverrides = override.filter((val) => isAllowed(val));
            const configuredFilterType =
              interactiveFiltersConfig.dataFilters.filterTypes[iri];

            if (configuredFilterType === "multi") {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(
                  validOverrides.map((v) => [v, true])
                ),
              };
            } else if (validOverrides.length > 1) {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(
                  validOverrides.map((v) => [v, true])
                ),
              };
            } else if (validOverrides.length === 1) {
              acc[iri] = { type: "single", value: validOverrides[0] };
            } else {
              acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
            }
            return acc;
          }

          if (
            overrideChanged &&
            override &&
            typeof override === "string" &&
            isAllowed(override)
          ) {
            acc[iri] = { type: "single", value: override };
            return acc;
          }

          if (overrideChanged && lastOverride && override === undefined) {
            acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
            return acc;
          }

          if (current?.type === "single" && isAllowed(current.value)) {
            acc[iri] = current;
            return acc;
          }

          if (current?.type === "multi") {
            const validValues = Object.keys(current.values).filter(isAllowed);
            const configuredFilterType =
              interactiveFiltersConfig.dataFilters.filterTypes[iri];

            if (configuredFilterType === "multi") {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(validValues.map((v) => [v, true])),
              };
            } else if (validValues.length > 1) {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(validValues.map((v) => [v, true])),
              };
            } else if (validValues.length === 1) {
              acc[iri] = { type: "single", value: validValues[0] };
            } else {
              acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
            }
            return acc;
          }

          if (Array.isArray(override)) {
            const validOverrides = override.filter(isAllowed);
            const configuredFilterType =
              interactiveFiltersConfig.dataFilters.filterTypes[iri];

            if (configuredFilterType === "multi") {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(
                  validOverrides.map((v) => [v, true])
                ),
              };
            } else if (validOverrides.length > 1) {
              acc[iri] = {
                type: "multi",
                values: Object.fromEntries(
                  validOverrides.map((v) => [v, true])
                ),
              };
            } else if (validOverrides.length === 1) {
              acc[iri] = { type: "single", value: validOverrides[0] };
            } else {
              acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
            }
          } else if (typeof override === "string" && isAllowed(override)) {
            acc[iri] = { type: "single", value: override };
          } else {
            acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
          }
          return acc;
        }

        const current = currentDataFilters[iri];

        if (current?.type === "single" && current.value !== FIELD_VALUE_NONE) {
          acc[iri] = current;
        } else if (configFilter?.type === "single") {
          acc[iri] = configFilter;
        } else {
          acc[iri] = { type: "single", value: FIELD_VALUE_NONE };
        }

        return acc;
      },
      {} as { [key: string]: FilterValue }
    );

    if (!isEqual(next, currentDataFilters)) {
      setDataFilters(next);
    }

    const latestOverrides: Record<string, string[] | string | undefined> = {};

    for (const iri of newPotentialInteractiveDataFilters) {
      latestOverrides[iri] =
        interactiveFiltersConfig.dataFilters.defaultValueOverrides[iri];
    }

    lastOverridesRef.current = latestOverrides;
    isFirstRunRef.current = false;
  }, [
    dashboardFilters?.dataFilters.filters,
    filters,
    getInteractiveFiltersState,
    interactiveFiltersConfig.dataFilters.defaultValueOverrides,
    interactiveFiltersConfig.dataFilters.filterTypes,
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
