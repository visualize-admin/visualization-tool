import { ObservationValue } from "@/domain/data";

/** We can pin some filters' values to max value dynamically, so that when a new
 * value is added to the dataset, it will be automatically used as default filter
 * value for published charts.
 */
export const VISUALIZE_MAX_VALUE = "VISUALIZE_MAX_VALUE";

/** Checks if a given filter value is supposed to be dynamiaclly pinned to max
 * value.
 */
export const isDynamicMaxValue = (
  value: ObservationValue
): value is "VISUALIZE_MAX_VALUE" => {
  return value === VISUALIZE_MAX_VALUE;
};
