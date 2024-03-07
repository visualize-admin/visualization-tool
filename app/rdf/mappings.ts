import { TimeUnit } from "../graphql/resolver-types";

import * as ns from "./namespace";

export const timeUnits = new Map<string, TimeUnit>([
  [ns.time.unitYear.value, TimeUnit.Year],
  [ns.time.unitMonth.value, TimeUnit.Month],
  [ns.time.unitWeek.value, TimeUnit.Week],
  [ns.time.unitDay.value, TimeUnit.Day],
  [ns.time.unitHour.value, TimeUnit.Hour],
  [ns.time.unitMinute.value, TimeUnit.Minute],
  [ns.time.unitSecond.value, TimeUnit.Second],
]);

export const unitsToNode = new Map(
  Array.from(timeUnits.entries()).map(([k, v]) => [v, k])
);

export const timeFormats = new Map<string, string>([
  [ns.xsd.gYear.value, "%Y"],
  [ns.xsd.gYearMonth.value, "%Y-%m"],
  [ns.xsd.date.value, "%Y-%m-%d"],
  [ns.xsd.dateTime.value, "%Y-%m-%dT%H:%M:%S"],
]);
