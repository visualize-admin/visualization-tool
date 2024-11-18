import { t } from "@lingui/macro";
import { ascending, descending } from "d3-array";
import { TimeLocaleObject } from "d3-time-format";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

import {
  hasChartConfigs,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import {
  Dimension,
  getTemporalEntityValue,
  isTemporalDimensionWithTimeUnit,
  isTemporalEntityDimension,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { useConfigsCubeComponents } from "@/graphql/hooks";
import { TimeUnit } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";
import { timeUnitFormats, timeUnitOrder } from "@/rdf/mappings";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";

/** Hook to get combined temporal dimension. Useful for shared dashboard filters. */
export const useCombinedTemporalDimension = () => {
  const locale = useLocale();
  const formatLocale = useTimeFormatLocale();
  const [state] = useConfiguratorState(hasChartConfigs);
  const { potentialTimeRangeFilterIris } = useDashboardInteractiveFilters();
  const [{ data }] = useConfigsCubeComponents({
    variables: {
      state,
      locale,
    },
  });

  return useMemo(() => {
    return getCombinedTemporalDimension({
      formatLocale,
      dimensions: data?.dataCubesComponents.dimensions ?? [],
      potentialTimeRangeFilterIris,
    });
  }, [
    data?.dataCubesComponents.dimensions,
    formatLocale,
    potentialTimeRangeFilterIris,
  ]);
};

export const getCombinedTemporalDimension = ({
  formatLocale,
  dimensions,
  potentialTimeRangeFilterIris,
}: {
  formatLocale: TimeLocaleObject;
  dimensions: Dimension[];
  potentialTimeRangeFilterIris: string[];
}) => {
  const timeUnitDimensions = dimensions.filter(
    (dimension) =>
      isTemporalDimensionWithTimeUnit(dimension) &&
      potentialTimeRangeFilterIris.includes(dimension.iri)
  ) as (TemporalDimension | TemporalEntityDimension)[];
  // We want to use lowest time unit for combined dimension filtering,
  // so in case we have year and day, we'd filter both by day
  const timeUnit = timeUnitDimensions.sort((a, b) =>
    descending(
      timeUnitOrder.get(a.timeUnit) ?? 0,
      timeUnitOrder.get(b.timeUnit) ?? 0
    )
  )[0]?.timeUnit as TimeUnit;
  const timeFormat = timeUnitFormats.get(timeUnit) as string;
  const values = timeUnitDimensions.flatMap((dimension) => {
    const formatDate = formatLocale.format(timeFormat);
    const parseDate = formatLocale.parse(dimension.timeFormat);
    // Standardize values to have same date format
    const temporalEntity = isTemporalEntityDimension(dimension);
    return dimension.values.map((dv) => {
      const date = parseDate(
        `${temporalEntity ? getTemporalEntityValue(dv) : dv.value}`
      ) as Date;
      const dateString = formatDate(date);
      return {
        ...dv,
        value: dateString,
        label: dateString,
      };
    });
  });
  const combinedDimension: TemporalDimension = {
    __typename: "TemporalDimension",
    cubeIri: "all",
    iri: "combined-date-filter",
    label: t({
      id: "controls.section.shared-filters.date",
      message: "Date",
    }),
    isKeyDimension: true,
    isNumerical: false,
    values: uniqBy(values, "value").sort((a, b) => ascending(a.value, b.value)),
    timeUnit,
    timeFormat,
  };

  return combinedDimension;
};
