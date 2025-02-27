import { Box, Typography } from "@mui/material";
import { rollups, sum } from "d3-array";
import groupBy from "lodash/groupBy";
import uniq from "lodash/uniq";
import { GetServerSideProps } from "next";

import { AppLayout } from "@/components/layout";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { ChartType, LayoutDashboard } from "@/config-types";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { Icon } from "@/icons";
import { defaultLocale } from "@/locales/locales";
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
import { queryCubesMetadata } from "@/statistics/sparql";
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
    countByCubeIri: {
      iri: string;
      title: string;
      creator?: string;
      count: number;
    }[];
  };
  views: StatProps;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  locale,
}) => {
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
  const cubeIris = chartsMetadata.flatMap((d) => d.iris);
  const cubesMetadata = await queryCubesMetadata({
    cubeIris: uniq(cubeIris),
    locale: locale ?? defaultLocale,
  });
  const cubesMetadataByIri = groupBy(cubesMetadata, (d) => d.iri);
  const unversionedCubeIris = cubeIris.map((iri) => {
    const unversionedIri = cubesMetadataByIri[iri]?.[0]?.unversionedIri;
    return unversionedIri ?? iri;
  });
  const cubesMetadataByUnversionedIri = groupBy(
    cubesMetadata,
    (d) => d.unversionedIri
  );
  const countByCubeIri = rollups(
    unversionedCubeIris,
    (v) => v.length,
    (d) => d
  )
    .map(([iri, count]) => {
      const { title, creator } = cubesMetadataByUnversionedIri[iri]?.[0] ?? {
        title: iri,
        creator: undefined,
      };

      return { iri, title, creator, count };
    })
    .sort((a, b) => b.count - a.count);

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
        countByCubeIri: countByCubeIri,
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
        <SectionTitleWrapper>
          <SectionTitle title="Popularity statistics" />
          <Typography>
            Gain insights into number of charts and view trends in Visualize.
          </Typography>
          <Typography>
            The data on chart views <b>is not complete</b> as it was started to
            be collected in 2024.
          </Typography>
        </SectionTitleWrapper>
        <Typography variant="caption" component="p" sx={{ mt: 2 }}>
          <b>Views</b> are counted when a user opens a published chart in{" "}
          <code>/v</code> page or through iframe.
        </Typography>
        <Typography variant="caption" component="p">
          <b>Previews</b> are counted when accessing a chart preview through{" "}
          <code>/preview</code> or <code>/preview_post</code> pages and are not
          connected to a chart config.
        </Typography>
        <CardGrid>
          {charts.countByDay.length > 0 && (
            <StatsCard
              countByDay={charts.countByDay}
              trendAverages={charts.trendAverages}
              title={(total) =>
                `Visualize users created ${formatInteger(total)} charts...`
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
                `...viewed ${formatInteger(total)} times (${formatInteger(
                  sum(
                    views.countByDay.filter((d) => d.type === "preview"),
                    (d) => d.count
                  )
                )} previews)`
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
          <SectionTitle title="Charts" />
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
            title={`Individual charts were made using ${formatInteger(
              uniq(charts.countByCubeIri.map((d) => d.iri)).length
            )} cubes`}
            subtitle="Cubes are the data sources used in individual charts."
            data={charts.countByCubeIri.map(({ title, count }) => [
              title,
              {
                count,
                label: title,
              },
            ])}
            columnName="Cube name (IRI if name is missing)"
            showPercentage
          />
          <BaseStatsCard
            title={`Cubes come from ${formatInteger(
              uniq(
                charts.countByCubeIri
                  .filter((d) => d.creator)
                  .map((d) => d.creator)
              ).length
            )} known creators`}
            subtitle="Creators are the organizations that create the cubes."
            data={rollups(
              charts.countByCubeIri,
              (v) => sum(v, (d) => d.count),
              (d) => d.creator
            )
              .sort((a, b) => (b[0] === undefined ? -1 : b[1] - a[1]))
              .map(([creator, count]) => [
                creator ?? "Unknown",
                {
                  count,
                  label: creator ?? <i>Unknown</i>,
                },
              ])}
            columnName="Cube creator"
            showPercentage
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
