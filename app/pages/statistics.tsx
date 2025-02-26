import { Box } from "@mui/material";
import { rollups, sum } from "d3-array";
import { GetServerSideProps } from "next";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import prisma from "@/db/client";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { Icon } from "@/icons";
import { useLocale } from "@/src";
import { BaseStatsCard } from "@/statistics/base-stats-card";
import { ChartLink } from "@/statistics/chart-link";
import { formatInteger } from "@/statistics/formatters";
import { StatProps, StatsCard } from "@/statistics/stats-card";

type PageProps = {
  charts: StatProps & {
    mostPopularAllTime: {
      key: string;
      createdDate: Date;
      viewCount: number;
    }[];
    mostPopularThisMonth: {
      key: string;
      viewCount: number;
    }[];
  };
  views: StatProps;
  chartsMetadata: {
    day: Date;
    chartTypes: string[];
    layoutType?: string;
    layoutSubtype?: string;
  }[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const [
    mostPopularAllTimeCharts,
    mostPopularThisMonthCharts,
    chartCountByDay,
    chartTrendAverages,
    viewCountByDay,
    viewTrendAverages,
    chartsMetadata,
  ] = await Promise.all([
    prisma.config
      .findMany({
        select: {
          key: true,
          created_at: true,
          _count: {
            select: {
              views: true,
            },
          },
        },
        orderBy: {
          views: {
            _count: "desc",
          },
        },
        take: 25,
      })
      .then((rows) =>
        rows.map((row) => {
          return {
            key: row.key,
            createdDate: row.created_at,
            viewCount: row._count.views,
          };
        })
      ),
    prisma.$queryRaw`
      SELECT config_key AS key, COUNT(*) AS view_count
      FROM config_view
      WHERE viewed_at > CURRENT_DATE - INTERVAL '30 days'
      GROUP BY config_key
      ORDER BY view_count DESC
      LIMIT 25;
    `.then((rows) => {
      return (
        rows as {
          key: string;
          view_count: BigInt;
        }[]
      ).map((row) => ({
        key: row.key,
        // superjson conversion breaks when we use default BigInt
        viewCount: Number(row.view_count),
      }));
    }),
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', created_at) AS day,
        COUNT(*) AS count
      FROM
        config
      GROUP BY
        DATE_TRUNC('day', created_at)
      ORDER BY
        day DESC;`.then((rows) =>
      (rows as { day: Date; count: BigInt }[]).map((row) => ({
        ...row,
        // superjson conversion breaks when we use default BigInt
        count: Number(row.count),
      }))
    ),
    prisma.$queryRaw`
    WITH
    last_month_daily_average AS (
        SELECT COUNT(*) / 30.0 AS daily_average
        FROM config
        WHERE
          created_at > CURRENT_DATE - INTERVAL '30 days'
          AND created_at <= CURRENT_DATE
    ),
    last_three_months_daily_average AS (
        SELECT COUNT(*) / 90.0 AS daily_average
        FROM config
        WHERE
          created_at > CURRENT_DATE - INTERVAL '90 days'
          AND created_at <= CURRENT_DATE
    )
    SELECT
      (SELECT daily_average FROM last_month_daily_average) AS last_month_daily_average,
      (SELECT daily_average FROM last_three_months_daily_average) AS previous_three_months_daily_average;
    `.then((rows) => {
      const row = (
        rows as {
          last_month_daily_average: number;
          previous_three_months_daily_average: number;
        }[]
      )[0];
      return {
        // superjson conversion breaks when we use default BigInt
        lastMonthDailyAverage: Number(row.last_month_daily_average),
        previousThreeMonthsDailyAverage: Number(
          row.previous_three_months_daily_average
        ),
      };
    }),
    // Unfortunately we can't abstract this out to a function because of the way Prisma works
    // see https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access/raw-queries#considerations
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', viewed_at) AS day,
        COUNT(*) AS count
      FROM
        config_view
      GROUP BY
        DATE_TRUNC('day', viewed_at)
      ORDER BY
        day DESC;`.then((rows) =>
      (rows as { day: Date; count: BigInt }[]).map((row) => ({
        ...row,
        // superjson conversion breaks when we use default BigInt
        count: Number(row.count),
      }))
    ),
    prisma.$queryRaw`
    WITH
    last_month_daily_average AS (
        SELECT COUNT(*) / 30.0 AS daily_average
        FROM config_view
        WHERE
          viewed_at > CURRENT_DATE - INTERVAL '30 days'
          AND viewed_at <= CURRENT_DATE
    ),
    last_three_months_daily_average AS (
        SELECT COUNT(*) / 90.0 AS daily_average
        FROM config_view
        WHERE
          viewed_at > CURRENT_DATE - INTERVAL '90 days'
          AND viewed_at <= CURRENT_DATE
    )
    SELECT
      (SELECT daily_average FROM last_month_daily_average) AS last_month_daily_average,
      (SELECT daily_average FROM last_three_months_daily_average) AS previous_three_months_daily_average;
    `.then((rows) => {
      const row = (
        rows as {
          last_month_daily_average: number;
          previous_three_months_daily_average: number;
        }[]
      )[0];
      return {
        // superjson conversion breaks when we use default BigInt
        lastMonthDailyAverage: Number(row.last_month_daily_average),
        previousThreeMonthsDailyAverage: Number(
          row.previous_three_months_daily_average
        ),
      };
    }),
    prisma.$queryRaw`
SELECT
DATE_TRUNC('day', created_at) AS day,
  COALESCE(jsonb_agg(chart_config_array ->> 'chartType'), jsonb_build_array(chart_config_obj ->> 'chartType')) AS chart_types,
  layout -> 'type' AS layout_type,
  layout -> 'layout' AS layout_subtype
FROM config
LEFT JOIN LATERAL jsonb_array_elements(data -> 'chartConfigs') AS chart_config_array ON true
LEFT JOIN LATERAL (SELECT data -> 'chartConfig' AS chart_config_obj) AS single_config ON true
LEFT JOIN LATERAL (SELECT data -> 'layout' AS layout) AS layout ON true
GROUP BY  day, data, chart_config_obj, layout, layout_subtype
    `.then((rows) =>
      (
        rows as {
          day: Date;
          chart_types: string[];
          layout_type?: string;
          layout_subtype?: string;
        }[]
      ).map((row) => ({
        day: new Date(row.day),
        chartTypes: row.chart_types,
        layoutType: row.layout_type,
        layoutSubtype: row.layout_subtype,
      }))
    ),
  ]);

  return {
    props: serializeProps({
      charts: {
        mostPopularAllTime: mostPopularAllTimeCharts,
        mostPopularThisMonth: mostPopularThisMonthCharts,
        countByDay: chartCountByDay,
        trendAverages: chartTrendAverages,
      },
      views: {
        countByDay: viewCountByDay,
        trendAverages: viewTrendAverages,
      },
      chartsMetadata,
    }),
  };
};

const Statistics = (props: Serialized<PageProps>) => {
  const { charts, views } = deserializeProps(props);
  const locale = useLocale();

  return (
    <AppLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          my: `${BANNER_MARGIN_TOP + 36}px`,
          px: 4,
        }}
      >
        <h1 style={{ margin: 0 }}>Statistics</h1>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: ["1fr", "1fr", "1fr 1fr"],
            gap: 4,
            my: [4, 6],
          }}
        >
          {charts.countByDay.length > 0 && (
            <StatsCard
              countByDay={charts.countByDay}
              trendAverages={charts.trendAverages}
              title={(total) =>
                `Visualize users created ${formatInteger(total)} charts in total`
              }
              subtitle={(total, avgMonthlyCount) =>
                `${total ? ` It's around ${formatInteger(avgMonthlyCount)} chart${avgMonthlyCount > 1 ? "s" : ""} per month on average.` : ""}`
              }
            />
          )}
          {views.countByDay.length > 0 && (
            <StatsCard
              countByDay={views.countByDay}
              trendAverages={views.trendAverages}
              title={(total) =>
                `Charts were viewed ${formatInteger(total)} times in total`
              }
              subtitle={(total, avgMonthlyCount) =>
                `${total ? ` It's around ${formatInteger(avgMonthlyCount)} view${avgMonthlyCount > 1 ? "s" : ""} per month on average.` : ""}`
              }
            />
          )}
          {charts.mostPopularAllTime.length > 0 && (
            <BaseStatsCard
              title="Most popular charts (all time)"
              subtitle="Top 25 charts by view count."
              data={charts.mostPopularAllTime.map((chart) => [
                chart.key,
                {
                  count: chart.viewCount,
                  label: <ChartLink locale={locale} chartKey={chart.key} />,
                },
              ])}
              columnName="Chart link"
            />
          )}
          {charts.mostPopularThisMonth.length > 0 && (
            <BaseStatsCard
              title="Most popular charts (last 30 days)"
              subtitle="Top 25 charts by view count."
              data={charts.mostPopularThisMonth.map((chart) => [
                chart.key,
                {
                  count: chart.viewCount,
                  label: <ChartLink locale={locale} chartKey={chart.key} />,
                },
              ])}
              columnName="Chart link"
            />
          )}
        </Box>
      </Box>
    </AppLayout>
  );
};

export default Statistics;
