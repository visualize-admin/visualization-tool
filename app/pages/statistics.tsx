import { Box, Typography } from "@mui/material";
import { rollups, sum } from "d3-array";
import { GetServerSideProps } from "next";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { ChartType, LayoutDashboard } from "@/config-types";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
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
    countByChartType: {
      type: ChartType;
      count: number;
    }[];
    countByLayoutTypeAndSubtype: {
      type: "single" | "dashboard";
      subtype?: LayoutDashboard["layout"] | "tab" | null;
      count: number;
    }[];
    count: number;
    dashboardCount: number;
    iris: string[];
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

  const chartCountByLayoutTypeAndSubtype = rollups(
    chartsMetadata,
    (v) => v.length,
    ({ chartTypes, layoutType = "single" }) => {
      if (chartTypes.length === 1 || layoutType === "singleURLs") {
        return "single" as const;
      }

      return "dashboard" as const;
    },
    ({ chartTypes, layoutType, layoutSubtype }) => {
      return chartTypes.length === 1
        ? null
        : layoutType === "tab" || !layoutSubtype
          ? ("tab" as const)
          : layoutSubtype;
    }
  )
    .flatMap(([type, subtypeCounts]) => {
      return subtypeCounts.map(([subtype, count]) => ({
        type,
        subtype,
        count,
      }));
    })
    .sort((a, b) => b.count - a.count);
  const chartCountByChartType = rollups(
    chartsMetadata.flatMap((d) => d.chartTypes),
    (v) => v.length,
    (d) => d
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  const count = sum(chartCountByLayoutTypeAndSubtype, (d) => d.count);
  const dashboardCount = sum(
    chartCountByLayoutTypeAndSubtype.filter((d) => d.type !== "single"),
    (d) => d.count
  );

  return {
    props: serializeProps({
      charts: {
        mostPopularAllTime: mostPopularAllTimeCharts,
        mostPopularThisMonth: mostPopularThisMonthCharts,
        countByDay: chartCountByDay,
        countByChartType: chartCountByChartType,
        countByLayoutTypeAndSubtype: chartCountByLayoutTypeAndSubtype,
        count: count,
        dashboardCount: dashboardCount,
        trendAverages: chartTrendAverages,
        iris: chartsMetadata.flatMap((d) => d.iris),
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

  console.log("charts", charts);

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
        <SectionTitleWrapper>
          <SectionTitle title="Chart details" />
          <Typography>
            Gain insights into the characteristics of the charts created in
            Visualize.
          </Typography>
        </SectionTitleWrapper>
        <CardGrid>
          <BaseStatsCard
            title={`Visualize users created ${formatInteger(sum(charts.countByChartType, (d) => d.count))} individual* charts`}
            subtitle="*Dashboards contain multiple charts; here we count them individually."
            data={charts.countByChartType.map(({ type, count }) => [
              type,
              {
                count,
                label: (
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Icon size={18} name={getIconName(type)} />{" "}
                    {getFieldLabel(type) || type}
                  </Box>
                ),
              },
            ])}
            columnName="Chart type"
            showPercentage
          />
          <BaseStatsCard
            title={`There are ${formatInteger(
              charts.dashboardCount
            )} Visualize dashboards`}
            subtitle={`It accounts for around ${(
              (charts.dashboardCount / charts.count) *
              100
            ).toFixed(0)}% of all charts created.`}
            data={charts.countByLayoutTypeAndSubtype.map(
              ({ type, subtype, count }) => [
                type,
                {
                  count,
                  label: getChartTypeSubtypeLabel({ type, subtype }),
                },
              ]
            )}
            columnName="Layout type"
            showPercentage
          />
        </CardGrid>
        <SectionTitleWrapper>
          <SectionTitle title="Cubes" />
          <Typography>
            Gain insights into the cubes used in the charts created in
            Visualize.
          </Typography>
        </SectionTitleWrapper>
        <CardGrid>
          <BaseStatsCard
            title={`Visualize users created charts using ${formatInteger(
              rollups(
                charts.iris,
                (v) => v.length,
                (d) => d
              ).length
            )} unique cubes`}
            subtitle="Cubes are the data sources used in the charts."
            data={rollups(
              charts.iris,
              (v) => v.length,
              (d) => d
            )
              .sort((a, b) => b[1] - a[1])
              .map(([iri, count]) => [
                iri,
                {
                  count,
                  label: iri,
                },
              ])}
            columnName="Cube"
          />
        </CardGrid>
      </Box>
    </AppLayout>
  );
};

const getChartTypeSubtypeLabel = ({
  type,
  subtype,
}: {
  type: "single" | "dashboard";
  subtype?: LayoutDashboard["layout"] | "tab" | null;
}) => {
  if (type === "single") {
    return "Single chart";
  }

  if (subtype === "tab") {
    return "Tab dashboard";
  }

  if (subtype === "canvas") {
    return "Free canvas dashboard";
  }

  if (subtype === "tall") {
    return "Tall dashboard";
  }

  if (subtype === "vertical") {
    return "Vertical dashboard";
  }

  return type ?? subtype ?? "Unknown";
};

export default Statistics;
