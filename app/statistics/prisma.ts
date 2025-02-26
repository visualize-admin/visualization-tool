import { ChartType, LayoutDashboard, LayoutType } from "@/config-types";
import prisma from "@/db/client";

export const fetchMostPopularAllTimeCharts = async () => {
  return await prisma.config
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
    );
};

export const fetchMostPopularThisMonthCharts = async () => {
  return await prisma.$queryRaw<{ key: string; view_count: BigInt }[]>`
    SELECT
      config_key AS key, COUNT(*) AS view_count
    FROM
      config_view
    WHERE
      viewed_at > CURRENT_DATE - INTERVAL '30 days'
    GROUP BY
      config_key
    ORDER BY
      view_count DESC
    LIMIT 25;
  `.then((rows) => {
    return rows.map((row) => ({
      key: row.key,
      // superjson conversion breaks when we use default BigInt
      viewCount: Number(row.view_count),
    }));
  });
};

export const fetchChartCountByDay = async () => {
  return await prisma.$queryRaw<{ day: Date; count: BigInt }[]>`
    SELECT
      DATE_TRUNC('day', created_at) AS day,
      COUNT(*) AS count
    FROM
      config
    GROUP BY
      DATE_TRUNC('day', created_at)
    ORDER BY
      day DESC;
  `.then((rows) => {
    return rows.map((row) => ({
      ...row,
      // superjson conversion breaks when we use default BigInt
      count: Number(row.count),
    }));
  });
};

export const fetchChartTrendAverages = async () => {
  return await prisma.$queryRaw<
    {
      last_month_daily_average: number;
      previous_three_months_daily_average: number;
    }[]
  >`
    WITH
      last_month_daily_average AS (
        SELECT COUNT(*) / 30.0 AS daily_average
        FROM config
        WHERE
          created_at > CURRENT_DATE - INTERVAL '30 days' AND created_at <= CURRENT_DATE
      ),
      last_three_months_daily_average AS (
        SELECT COUNT(*) / 90.0 AS daily_average
        FROM config
        WHERE
          created_at > CURRENT_DATE - INTERVAL '90 days' AND created_at <= CURRENT_DATE
      )
    SELECT
      (SELECT daily_average FROM last_month_daily_average) AS last_month_daily_average,
      (SELECT daily_average FROM last_three_months_daily_average) AS previous_three_months_daily_average;
  `.then((rows) => {
    const row = rows[0];

    return {
      // superjson conversion breaks when we use default BigInt
      lastMonthDailyAverage: Number(row.last_month_daily_average),
      previousThreeMonthsDailyAverage: Number(
        row.previous_three_months_daily_average
      ),
    };
  });
};

export const fetchViewCountByDay = async () => {
  return await prisma.$queryRaw<{ day: Date; count: BigInt }[]>`
    SELECT
      DATE_TRUNC('day', viewed_at) AS day,
      COUNT(*) AS count
    FROM
      config_view
    GROUP BY
      DATE_TRUNC('day', viewed_at)
    ORDER BY
      day DESC;
  `.then((rows) => {
    return rows.map((row) => ({
      ...row,
      // superjson conversion breaks when we use default BigInt
      count: Number(row.count),
    }));
  });
};

export const fetchViewTrendAverages = async () => {
  return await prisma.$queryRaw<
    {
      last_month_daily_average: number;
      previous_three_months_daily_average: number;
    }[]
  >`
    WITH
      last_month_daily_average AS (
        SELECT COUNT(*) / 30.0 AS daily_average
        FROM config_view
        WHERE
          viewed_at > CURRENT_DATE - INTERVAL '30 days' AND viewed_at <= CURRENT_DATE
      ),
      last_three_months_daily_average AS (
        SELECT COUNT(*) / 90.0 AS daily_average
        FROM config_view
        WHERE
          viewed_at > CURRENT_DATE - INTERVAL '90 days' AND viewed_at <= CURRENT_DATE
      )
    SELECT
      (SELECT daily_average FROM last_month_daily_average) AS last_month_daily_average,
      (SELECT daily_average FROM last_three_months_daily_average) AS previous_three_months_daily_average;
  `.then((rows) => {
    const row = rows[0];

    return {
      // superjson conversion breaks when we use default BigInt
      lastMonthDailyAverage: Number(row.last_month_daily_average),
      previousThreeMonthsDailyAverage: Number(
        row.previous_three_months_daily_average
      ),
    };
  });
};

export const fetchChartsMetadata = async () => {
  return await prisma.$queryRaw<
    {
      day: Date;
      chart_types: ChartType[];
      layout_type?: LayoutType;
      layout_subtype?: LayoutDashboard["layout"];
    }[]
  >`
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
  `.then((rows) => {
    return rows.map((row) => ({
      day: row.day,
      chartTypes: row.chart_types,
      layoutType: row.layout_type,
      layoutSubtype: row.layout_subtype,
    }));
  });
};
