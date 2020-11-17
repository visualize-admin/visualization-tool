import React, { memo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";
import { TableConfig } from "../../configurator";
import { isNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
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

  const measures = Object.keys(chartConfig.fields).filter(
    (key) =>
      chartConfig.fields[key].componentType === "Measure" &&
      !chartConfig.fields[key].isHidden
  );

  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures,
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
  } else {
    return <Loading />;
  }
};

export const ChartTable = memo(
  ({
    observations,
    dimensions,
    measures,
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    chartConfig: TableConfig;
  }) => {
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
  }
);
