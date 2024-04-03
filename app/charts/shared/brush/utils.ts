import { bisector } from "d3-array";

export function makeGetClosestDatesFromDateRange<T>(
  sortedData: T[],
  getDate: (d: T) => Date
) {
  return (from: Date, to: Date) => {
    if (sortedData.length === 0) {
      return [from, to] as [Date, Date];
    }

    const fromTime = from.getTime();
    const toTime = to.getTime();

    const bisectDateLeft = bisector((d: T, date: Date) => {
      return getDate(d).getTime() - date.getTime();
    }).left;

    const startIndex = bisectDateLeft(sortedData, from, 1);
    const dStartLeft = sortedData[startIndex - 1];
    const dStartRight = sortedData[startIndex] ?? dStartLeft;
    const startClosestDatum =
      fromTime - getDate(dStartLeft).getTime() >
      getDate(dStartRight).getTime() - fromTime
        ? dStartRight
        : dStartLeft;

    const bisectDateRight = bisector((d: T, date: Date) => {
      return getDate(d).getTime() - date.getTime();
    }).right;
    const endIndex = bisectDateRight(sortedData, to, 1);
    const dEndLeft = sortedData[endIndex - 1];
    const dEndRight = sortedData[endIndex] ?? dEndLeft;
    const endClosestDatum =
      toTime - getDate(dEndLeft).getTime() >
      getDate(dEndRight).getTime() - toTime
        ? dEndRight
        : dEndLeft;

    return [getDate(startClosestDatum), getDate(endClosestDatum)] as [
      Date,
      Date,
    ];
  };
}
