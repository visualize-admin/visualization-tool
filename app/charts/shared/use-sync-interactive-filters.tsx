import { useEffect, useMemo } from "react";

import {
  ChartConfig,
  DashboardFiltersConfig,
  FilterValueSingle,
  isSegmentInConfig,
  useChartConfigFilters,
} from "@/config-types";
import { parseDate } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import useFilterChanges from "@/configurator/use-filter-changes";
import { truthy } from "@/domain/types";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

/**
 * Makes sure interactive filters are in sync with chart config.
 *
 * - when a filter is set in the chart config, it should be reflected at once
 *   inside the interactive filters
 *
 */
const useSyncInteractiveFilters = (
  chartConfig: ChartConfig,
  dashboardFilters: DashboardFiltersConfig | undefined
) => {
  const { interactiveFiltersConfig } = chartConfig;
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
      setTimeRange(presetFrom, presetTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTimeRange, presetFromStr, presetToStr]);

  // Data Filters
  const componentIris = interactiveFiltersConfig?.dataFilters.componentIris;
  const dashboardComponentIris = dashboardFilters?.dataFilters.componentIris;
  const newPotentialInteractiveDataFilters = useMemo(() => {
    if (componentIris) {
      // If dimension is already in use as interactive filter, use it,
      // otherwise, default to editor config filter dimension value (only
      // if dashboard filters are not set).
      return componentIris.concat(dashboardComponentIris ?? []);
    }
  }, [componentIris, dashboardComponentIris]);

  useEffect(() => {
    if (newPotentialInteractiveDataFilters) {
      const newInteractiveDataFilters = Object.fromEntries(
        Object.entries(newPotentialInteractiveDataFilters)
          .map(([iri]) => {
            const dashboardFilter = dashboardFilters?.dataFilters.filters[iri];
            return dashboardFilter?.type === "single"
              ? ([iri, dashboardFilter] as const)
              : null;
          })
          .filter(truthy)
      );

      setDataFilters(newInteractiveDataFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newPotentialInteractiveDataFilters,
    dashboardComponentIris,
    dashboardFilters?.dataFilters.filters,
  ]);

  useEffect(() => {
    if (newPotentialInteractiveDataFilters) {
      const newInteractiveDataFilters =
        newPotentialInteractiveDataFilters.reduce(
          (obj, iri) => {
            const configFilter = filters[iri];
            if (Object.keys(dataFilters).includes(iri)) {
              obj[iri] = dataFilters[iri];
            } else if (configFilter?.type === "single") {
              obj[iri] = configFilter;
            }
            return obj;
          },
          {} as { [key: string]: FilterValueSingle }
        );

      setDataFilters(newInteractiveDataFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPotentialInteractiveDataFilters, setDataFilters]);

  const changes = useFilterChanges(filters);
  useEffect(() => {
    if (changes.length !== 1) {
      return;
    }

    const [dimensionIri, prev, next] = changes[0];
    if (prev?.type === "single" || next?.type === "single") {
      updateDataFilter(
        dimensionIri,
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
  const calculationActive = interactiveFiltersConfig?.calculation.active;
  const calculationType = interactiveFiltersConfig?.calculation.type;
  useEffect(() => {
    if (calculationType) {
      setCalculationType(calculationType);
    }
  }, [calculationActive, calculationType, setCalculationType]);
};

export default useSyncInteractiveFilters;
