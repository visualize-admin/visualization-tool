import { Box, Typography } from "@mui/material";
import { rollups, sum } from "d3-array";
import { GetServerSideProps } from "next";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { ChartType, LayoutDashboard, LayoutType } from "@/config-types";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { Icon } from "@/icons";
import { useLocale } from "@/src";
import { BaseStatsCard } from "@/statistics/base-stats-card";
import { CardGrid } from "@/statistics/card-grid";
import { ChartLink } from "@/statistics/chart-link";
import { formatInteger } from "@/statistics/formatters";
import {
  fetchChartCountByDay,
  fetchChartsMetadata,
  fetchChartTrendAverages,
  fetchMostPopularAllTimeCharts,
  fetchMostPopularThisMonthCharts,
  fetchViewCountByDay,
  fetchViewTrendAverages,
} from "@/statistics/prisma";
import { SectionTitle, SectionTitleWrapper } from "@/statistics/sections";
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
    fetchMostPopularAllTimeCharts(),
    fetchMostPopularThisMonthCharts(),
    fetchChartCountByDay(),
    fetchChartTrendAverages(),
    fetchViewCountByDay(),
    fetchViewTrendAverages(),
    fetchChartsMetadata(),
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
        <SectionTitleWrapper>
          <SectionTitle title="Basic statistics" />
          <Typography>
            Gain insights into number of charts and view trends in Visualize.
          </Typography>
          <Typography>
            The data on chart views <b>is not complete</b> as it was started to
            be collected in 2024.
          </Typography>
        </SectionTitleWrapper>
        <CardGrid>
          {charts.countByDay.length > 0 && (
            <StatsCard
              countByDay={charts.countByDay}
              trendAverages={charts.trendAverages}
              title={(total) =>
                `Visualize users created ${formatInteger(total)} charts`
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
                `Charts were viewed ${formatInteger(total)} times`
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
        </CardGrid>
        </Box>
      </Box>
    </AppLayout>
  );
};

export default Statistics;
