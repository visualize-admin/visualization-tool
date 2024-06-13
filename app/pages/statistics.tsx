/* eslint-disable visualize-admin/no-large-sx */
import { Box, Card, Tooltip, Typography } from "@mui/material";
import { max, rollups, sum } from "d3-array";
import { timeFormat } from "d3-time-format";
import { motion } from "framer-motion";
import uniq from "lodash/uniq";
import { GetServerSideProps } from "next";
import { ComponentProps, useMemo } from "react";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import prisma from "@/db/client";
import { Serialized, deserializeProps, serializeProps } from "@/db/serialize";
import { useFlag } from "@/flags";

type PageProps = {
  countByDay: { day: Date; count: number }[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  return {
    props: serializeProps({
      countByDay: await prisma.$queryRaw`
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
          // superjson conversion breaks when we use BigInt
          count: Number(row.count),
        }))
      ),
    }),
  };
};

const Statistics = (props: Serialized<PageProps>) => {
  const { countByDay } = deserializeProps(props);
  const { countByYearMonth, total } = useMemo(() => {
    return {
      countByYearMonth: groupByYearMonth(countByDay),
      total: sum(countByDay, (d) => d.count) ?? 0,
    };
  }, [countByDay]);
  const trend = useMemo(() => getTrend(countByDay), [countByDay]);
  const averageChartCountPerMonth = Math.round(total / countByYearMonth.length);
  return (
    <AppLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: 840,
          mx: "auto",
          my: `${BANNER_MARGIN_TOP + 36}px`,
          px: 4,
        }}
      >
        <h1 style={{ margin: 0 }}>Statistics</h1>
        <CreatedChartsCard
          title={`Visualize users created ${total} charts in total`}
          subtitle={`${total ? ` It's around ${averageChartCountPerMonth} chart${averageChartCountPerMonth > 1 ? "s" : ""} per month on average.` : ""}`}
          data={countByYearMonth}
          trend={trend}
        />
      </Box>
    </AppLayout>
  );
};

export default Statistics;

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

const formatShortMonth = timeFormat("%b");
const formatYearMonth = timeFormat("%Y-%m");

const groupByYearMonth = (countByDay: PageProps["countByDay"]) => {
  const countByDate = rollups(
    countByDay,
    (v) => ({
      count: sum(v, (d) => d.count),
      date: v[0].day,
      monthStr: formatShortMonth(v[0].day),
    }),
    (d) => formatYearMonth(d.day)
  ).reverse();
  const allYearMonthStrings = uniq(
    countByDate.map(([yearMonthStr]) => yearMonthStr)
  );
  const start = countByDate[0][1].date;
  const end = countByDate[countByDate.length - 1][1].date;
  for (let date = start; date <= end; date.setMonth(date.getMonth() + 1)) {
    if (!allYearMonthStrings.includes(formatYearMonth(date))) {
      countByDate.push([
        formatYearMonth(date),
        {
          count: 0,
          date,
          monthStr: formatShortMonth(date),
        },
      ]);
    }
  }
  countByDate.sort(([a], [b]) => b.localeCompare(a));
  return countByDate;
};

const getTrend = (
  data: PageProps["countByDay"]
): {
  direction: "up" | "down";
  lastMonthDailyAverage: number;
  previousThreeMonthsDailyAverage: number;
} => {
  const now = Date.now();
  const nowDate = new Date(now);
  const lastMonthDailyAverage =
    sum(
      data.filter(({ day }) => {
        return day > new Date(now - 30 * DAYS_IN_MS) && day <= nowDate;
      }),
      (v) => v.count
    ) / 30;
  const previousThreeMonthsDailyAverage =
    sum(
      data.filter(({ day }) => {
        return day > new Date(now - 90 * DAYS_IN_MS) && day <= nowDate;
      }),
      (v) => v.count
    ) / 90;
  return {
    direction:
      lastMonthDailyAverage > previousThreeMonthsDailyAverage ? "up" : "down",
    lastMonthDailyAverage,
    previousThreeMonthsDailyAverage,
  };
};

const CreatedChartsCard = ({
  title,
  subtitle,
  data,
  trend,
}: {
  title: string;
  subtitle: string;
  data: [string, { count: number; date: Date; monthStr: string }][];
  trend: ReturnType<typeof getTrend>;
}) => {
  const maxCount = max(data, ([, { count }]) => count) ?? 1;
  return (
    <Card
      sx={{
        my: 6,
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
          <Tooltip
            title={
              <>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {trend.direction === "up" ? "Upward trend" : "Downward trend"}
                </Typography>
                <Typography variant="caption">
                  Last 30 days daily average:{" "}
                  <b>{trend.lastMonthDailyAverage.toFixed(2)}</b>
                </Typography>
                <br />
                <Typography variant="caption">
                  Last 90 days daily average:{" "}
                  <b>{trend.previousThreeMonthsDailyAverage.toFixed(2)}</b>
                </Typography>
              </>
            }
          >
            <Typography variant="h4" component="span" sx={{ mt: "0.5em" }}>
              {trend.direction === "up" ? "📈" : "📉"}
            </Typography>
          </Tooltip>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: "normal" }}>
          {subtitle}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto auto 1fr",
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
            Date
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
        <Box
          sx={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100%",
            p: "0.3rem",
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            backgroundColor: "background.paper",
          }}
        />
        {data.map(([dateStr, datum]) => (
          <Bar key={dateStr} {...datum} dateStr={dateStr} maxCount={maxCount} />
        ))}
      </Box>
    </Card>
  );
};

const Bar = ({
  dateStr,
  monthStr,
  count,
  maxCount,
}: ComponentProps<typeof CreatedChartsCard>["data"][number][1] & {
  dateStr: string;
  maxCount: number;
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
          {monthStr} {dateStr.split("-")[0]}
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
        <Typography variant="caption">{count}</Typography>
      </Box>
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
                .map((x, i) => {
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
