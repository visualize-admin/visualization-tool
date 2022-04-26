import { Box } from "@mui/material";
import React, { memo } from "react";

import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import { TableConfig } from "@/configurator";
import { isNumber } from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartTableVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: TableConfig;
}) => {
  const locale = useLocale();

  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      dimensions: null,
      filters: chartConfig.filters,
    },
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <ChartTable
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          chartConfig={chartConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (observations && !observations.map((obs) => obs.y).some(isNumber)) {
    return <NoDataHint />;
  } else if (error) {
    return <LoadingDataError />;
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
