/* eslint-disable visualize-admin/no-large-sx */
import { Box, Card, Tooltip, Typography } from "@mui/material";
import { max, rollups, sum } from "d3-array";
import { timeFormat } from "d3-time-format";
import uniq from "lodash/uniq";
import { GetServerSideProps } from "next";
import { ComponentProps, useMemo } from "react";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { getAllConfigsMetadata } from "@/db/config";
import { Serialized, deserializeProps, serializeProps } from "@/db/serialize";
import { flag } from "@/flags";

type PageProps = {
  configsMetadata: Awaited<ReturnType<typeof getAllConfigsMetadata>>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  return {
    props: serializeProps({
      configsMetadata: (await getAllConfigsMetadata()).sort((a, b) => {
        return b.created_at.getTime() - a.created_at.getTime();
      }),
    }),
  };
};

const Statistics = (props: Serialized<PageProps>) => {
  const { configsMetadata } = deserializeProps(props);
  const countByDate = useMemo(
    () => getCountByDate(configsMetadata),
    [configsMetadata]
  );
  const total = sum(countByDate, (d) => d[1].count) ?? 0;
  const averageChartCountPerMonth = Math.round(total / countByDate.length);
  const now = Date.now();
  const nowDate = new Date(now);
  const lastMonthDailyAverage =
    configsMetadata.filter(({ created_at: date }) => {
      return date > new Date(now - 30 * DAYS_IN_MS) && date <= nowDate;
    }).length / 30;
  const previousThreeMonthsDailyAverage =
    configsMetadata.filter(({ created_at: date }) => {
      return date > new Date(now - 90 * DAYS_IN_MS) && date <= nowDate;
    }).length / 90;

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
          data={countByDate}
          trend={{
            direction:
              lastMonthDailyAverage > previousThreeMonthsDailyAverage
                ? "up"
                : "down",
            lastMonthDailyAverage,
            previousThreeMonthsDailyAverage,
          }}
        />
      </Box>
    </AppLayout>
  );
};

export default Statistics;

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

const formatShortMonth = timeFormat("%b");
const formatYearMonth = timeFormat("%Y-%m");

const getCountByDate = (
  configsMetadata: Awaited<ReturnType<typeof getAllConfigsMetadata>>
) => {
  const countByDate = rollups(
    configsMetadata,
    (v) => ({
      count: v.length,
      date: v[0].created_at,
      monthStr: formatShortMonth(v[0].created_at),
    }),
    (d) => formatYearMonth(d.created_at)
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

const CreatedChartsCard = ({
  title,
  subtitle,
  data,
  trend,
}: {
  title: string;
  subtitle: string;
  data: [string, { count: number; date: Date; monthStr: string }][];
  trend: {
    direction: "up" | "down";
    lastMonthDailyAverage: number;
    previousThreeMonthsDailyAverage: number;
  };
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
          <Box
            sx={{
              width: `${(count / maxCount) * 100}%`,
              height: "100%",
              backgroundColor: "primary.main",
            }}
          />
        ) : flag("easter-eggs") ? (
          "🥓🥓🥓"
        ) : null}
      </Box>
    </>
  );
};
