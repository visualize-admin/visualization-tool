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

export const timeUnitFormats = new Map<TimeUnit, string>([
  [TimeUnit.Year, "%Y"],
  [TimeUnit.Month, "%Y-%m"],
  [TimeUnit.Week, "%Y-%m-%d"],
  [TimeUnit.Day, "%Y-%m-%d"],
  [TimeUnit.Hour, "%Y-%m-%dT%H"],
  [TimeUnit.Minute, "%Y-%m-%dT%H:%M"],
  [TimeUnit.Second, "%Y-%m-%dT%H:%M:%S"],
]);

export const timeUnitOrder = new Map<TimeUnit, number>([
  [TimeUnit.Year, 0],
  [TimeUnit.Month, 1],
  [TimeUnit.Week, 2],
  [TimeUnit.Day, 3],
  [TimeUnit.Hour, 4],
  [TimeUnit.Minute, 5],
  [TimeUnit.Second, 6],
]);
