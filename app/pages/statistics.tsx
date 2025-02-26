/* eslint-disable visualize-admin/no-large-sx */
import { Box, Card, Link, Tooltip, Typography } from "@mui/material";
import { max, rollups, sum } from "d3-array";
import { formatLocale } from "d3-format";
import { motion } from "framer-motion";
import uniq from "lodash/uniq";
import { GetServerSideProps } from "next";
import { ComponentProps, ReactNode, useMemo } from "react";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import prisma from "@/db/client";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { useFlag } from "@/flags";
import { Icon } from "@/icons";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/src";

type StatProps = {
  countByDay: { day: Date; count: number }[];
  trendAverages: {
    lastMonthDailyAverage: number;
    previousThreeMonthsDailyAverage: number;
  };
};

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
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const [
    mostPopularAllTimeCharts,
    mostPopularThisMonthCharts,
    chartCountByDay,
    chartTrendAverages,
    viewCountByDay,
    viewTrendAverages,
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

const ChartLink = ({
  locale,
  chartKey,
}: {
  locale: Locale;
  chartKey: string;
}) => {
  return (
    <Link
      href={`/${locale}/v/${chartKey}`}
      target="_blank"
      color="primary"
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "space-between",
      }}
    >
      {chartKey}
      <Icon name="linkExternal" size={16} />
    </Link>
  );
};

export default Statistics;

const formatYearMonth = (date: Date, { locale }: { locale: Locale }) => {
  const year = date.getFullYear();
  const month = date.toLocaleDateString(locale, { month: "short" });
  return `${year} ${month}`;
};

const groupByYearMonth = (
  countByDay: PageProps[keyof PageProps]["countByDay"],
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
  countByDate.sort(([_a, a], [_b, b]) => b.date.getTime() - a.date.getTime());
  return countByDate;
};

const BaseStatsCard = ({
  title,
  subtitle,
  data,
  columnName = "Date",
  trend,
  showPercentage = false,
}: {
  title: string;
  subtitle: string;
  data: [string, { count: number; label: ReactNode }][];
  columnName?: string;
  trend?: {
    direction: "up" | "down";
    lastMonthDailyAverage: number;
    previousThreeMonthsDailyAverage: number;
  };
  showPercentage?: boolean;
}) => {
  const totalCount = sum(data, ([, { count }]) => count) ?? 1;
  const maxCount = max(data, ([, { count }]) => count) ?? 1;

  return (
    <Card
      sx={{
        width: "100%",
        pt: 4,
        boxShadow: 2,
        borderRadius: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: "grey.200",
      }}
    >
      <Box sx={{ px: 5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 24px", gap: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: "normal" }}>
            {title}
          </Typography>
          {trend ? (
            <Tooltip
              title={
                <>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {trend.direction === "up"
                      ? "Upward trend"
                      : "Downward trend"}
                  </Typography>
                  <Typography variant="caption">
                    Last 30 days daily average:{" "}
                    <b>
                      {trend.lastMonthDailyAverage >= 10
                        ? formatInteger(trend.lastMonthDailyAverage)
                        : trend.lastMonthDailyAverage.toFixed(2)}
                    </b>
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    Last 90 days daily average:{" "}
                    <b>
                      {trend.previousThreeMonthsDailyAverage >= 10
                        ? formatInteger(trend.previousThreeMonthsDailyAverage)
                        : trend.previousThreeMonthsDailyAverage.toFixed(2)}
                    </b>
                  </Typography>
                </>
              }
            >
              <Typography variant="h4" component="span" sx={{ mt: "0.5em" }}>
                {trend.direction === "up" ? "📈" : "📉"}
              </Typography>
            </Tooltip>
          ) : null}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: "normal" }}>
          {subtitle}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: showPercentage
            ? "auto auto auto 1fr"
            : "auto auto 1fr",
          gridTemplateRows: "auto",
          gap: "2px",
          width: "100%",
          height: "fit-content",
          // Roughly 12 rows
          maxHeight: "calc(12 * 2.3rem)",
          overflowY: "auto",
          mt: 3,
          p: 1,
          pt: 0,
          backgroundColor: "grey.200",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            width: "100%",
            py: "0.3rem",
            px: "0.6rem",
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="caption"
            sx={{ position: "sticky", top: 0, fontWeight: "bold" }}
          >
            {columnName}
          </Typography>
        </Box>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            width: "100%",
            py: "0.3rem",
            px: "0.6rem",
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            backgroundColor: "background.paper",
            textAlign: "end",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Count
          </Typography>
        </Box>
        {showPercentage ? (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              width: "100%",
              py: "0.3rem",
              px: "0.6rem",
              borderBottom: (t) => `2px solid ${t.palette.divider}`,
              backgroundColor: "background.paper",
              textAlign: "end",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              Share
            </Typography>
          </Box>
        ) : null}
        <Box
          sx={{
            zIndex: 1,
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100%",
            p: "0.3rem",
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            backgroundColor: "background.paper",
          }}
        />
        {data.map(([key, datum]) => (
          <Bar
            key={key}
            {...datum}
            maxCount={maxCount}
            totalCount={totalCount}
            showPercentage={showPercentage}
          />
        ))}
      </Box>
    </Card>
  );
};

const Bar = ({
  label,
  count,
  maxCount,
  totalCount,
  showPercentage,
}: ComponentProps<typeof BaseStatsCard>["data"][number][1] & {
  label: ReactNode;
  maxCount: number;
  totalCount: number;
  showPercentage?: boolean;
}) => {
  const easterEgg = useFlag("easter-eggs");

  return (
    <>
      <Box
        sx={{
          width: "100%",
          py: "0.3rem",
          px: "0.6rem",
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="caption" sx={{ cursor: "default" }}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          py: "0.3rem",
          px: "0.6rem",
          backgroundColor: "background.paper",
          textAlign: "end",
        }}
      >
        <Typography variant="caption">{formatInteger(count)}</Typography>
      </Box>
      {showPercentage ? (
        <Box
          sx={{
            width: "100%",
            py: "0.3rem",
            px: "0.6rem",
            backgroundColor: "background.paper",
            textAlign: "end",
          }}
        >
          <Typography variant="caption">
            {formatInteger((count / totalCount) * 100)}%
          </Typography>
        </Box>
      ) : null}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: "0.3rem",
          backgroundColor: "background.paper",
        }}
      >
        {count > 0 ? (
          !easterEgg ? (
            <Box
              sx={{
                width: `${(count / maxCount) * 100}%`,
                height: "100%",
                backgroundColor: "primary.main",
              }}
            />
          ) : (
            <>
              {Array(Math.ceil((count / maxCount) * 40))
                .fill(0)
                .map((_, i) => {
                  return (
                    <motion.div
                      key={i}
                      style={{ display: "inline-block" }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { delay: i * 0.03 },
                      }}
                    >
                      🥓
                    </motion.div>
                  );
                })}
            </>
          )
        ) : null}
      </Box>
    </>
  );
};

const StatsCard = (
  props: StatProps & {
    title: (total: number) => string;
    subtitle: (total: number, avgMonthlyCount: number) => string;
  }
) => {
  const { title, subtitle, countByDay, trendAverages } = props;
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
  return (
    <BaseStatsCard
      title={title(total)}
      subtitle={subtitle(total, avgMonthlyCount)}
      data={countByYearMonth}
      trend={{
        direction:
          lastMonthDailyAverage > previousThreeMonthsDailyAverage
            ? "up"
            : "down",
        lastMonthDailyAverage,
        previousThreeMonthsDailyAverage,
      }}
    />
  );
};

const formatInteger = formatLocale({
  decimal: ".",
  thousands: "\u00a0",
  grouping: [3],
  currency: ["", "\u00a0 CHF"],
  minus: "\u2212",
  percent: "%",
}).format(",d");
