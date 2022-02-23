import React, { memo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay } from "../../components/hint";
import { TableConfig } from "../../configurator";
import { Observation } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { useChartData } from "../shared/use-chart-data";
import { Table } from "./table";
import { TableChart } from "./table-state";

export const ChartTableVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: TableConfig;
}) => {
  const locale = useLocale();
  const { data, fetching } = useChartData({
    locale,
    iri: dataSetIri,
    filters: chartConfig.filters,
  });

  if (data?.dataCubeByIri) {
    const { dimensions, measures, observations } = data?.dataCubeByIri;
    return (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <ChartTable
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          chartConfig={chartConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const ChartTable = memo(function ChartTable({
  observations,
  dimensions,
  measures,
  chartConfig,
}: {
  observations: Observation[];
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
  chartConfig: TableConfig;
}) {
  return (
    <TableChart
      data={observations}
      dimensions={dimensions}
      measures={measures}
      chartConfig={chartConfig}
    >
      <Table />
    </TableChart>
  );
});
