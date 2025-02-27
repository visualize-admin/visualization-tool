import { rollups, sum } from "d3-array";
import uniq from "lodash/uniq";

import { Locale } from "@/locales/locales";
import { formatYearMonth } from "@/statistics/formatters";

export const groupByYearMonth = (
  countByDay: { day: Date; count: number }[],
  { locale }: { locale: Locale }
) => {
  const countByDate = rollups(
    countByDay,
    (v) => ({
      count: sum(v, (d) => d.count),
      date: v[v.length - 1].day,
      label: formatYearMonth(v[0].day, { locale }),
    }),
    (d) => formatYearMonth(d.day, { locale })
  ).reverse();
  const allYearMonthStrings = uniq(
    countByDate.map(([yearMonthStr]) => yearMonthStr)
  );
  const start = new Date(countByDate[0][1].date);
  const end = new Date(countByDate[countByDate.length - 1][1].date);

  if (start.getTime() !== end.getTime()) {
    for (let date = start; date <= end; date.setMonth(date.getMonth() + 1)) {
      const formattedDate = formatYearMonth(date, { locale });

      if (!allYearMonthStrings.includes(formattedDate)) {
        countByDate.push([
          formattedDate,
          {
            count: 0,
            date: new Date(date),
            label: formattedDate,
          },
        ]);
      }
    }
  }
  countByDate.sort(([, a], [, b]) => b.date.getTime() - a.date.getTime());

  return countByDate;
};
