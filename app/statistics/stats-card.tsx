import { sum } from "d3-array";
import { useMemo } from "react";

import { useLocale } from "@/locales/use-locale";
import { BaseStatsCard } from "@/statistics/base-stats-card";
import { groupByYearMonth } from "@/statistics/utils";

export type StatProps = {
  countByDay: {
    day: Date;
    type?: "view" | "preview";
    count: number;
  }[];
  trendAverages: {
    lastMonthDailyAverage: number;
    previousThreeMonthsDailyAverage: number;
  };
};

export const StatsCard = ({
  title,
  subtitle,
  countByDay,
  trendAverages,
}: StatProps & {
  title: (total: number) => string;
  subtitle: (total: number, avgMonthlyCount: number) => string;
}) => {
  const locale = useLocale();
  const { countByYearMonth, total } = useMemo(() => {
    return {
      countByYearMonth: groupByYearMonth(countByDay, { locale }),
      total: sum(countByDay, (d) => d.count) ?? 0,
    };
  }, [countByDay, locale]);
  const avgMonthlyCount = Math.round(total / countByYearMonth.length);
  const { lastMonthDailyAverage, previousThreeMonthsDailyAverage } =
    trendAverages;
  const direction =
    lastMonthDailyAverage > previousThreeMonthsDailyAverage ? "up" : "down";

  return (
    <BaseStatsCard
      title={title(total)}
      subtitle={subtitle(total, avgMonthlyCount)}
      data={countByYearMonth}
      trend={{
        direction,
        lastMonthDailyAverage,
        previousThreeMonthsDailyAverage,
      }}
    />
  );
};
