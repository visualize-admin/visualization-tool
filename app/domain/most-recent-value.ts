import { ObservationValue } from "@/domain/data";

/** We can pin some filters' values to max value dynamically, so that when a new
 * value is added to the dataset, it will be automatically used as default filter
 * value for published charts.
 */
export const VISUALIZE_MOST_RECENT_VALUE = "VISUALIZE_MOST_RECENT_VALUE";

/** Checks if a given filter value is supposed to be dynamiaclly pinned to max
 * value.
 */
export const isMostRecentValue = (
  value: ObservationValue
): value is "VISUALIZE_MOST_RECENT_VALUE" => {
  return value === VISUALIZE_MOST_RECENT_VALUE;
};
