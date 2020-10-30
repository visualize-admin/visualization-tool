import React, { memo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";
import { TableConfig, TableFields, TableSettings } from "../../configurator";

import { Observation } from "../../domain/data";
import { isNumber } from "../../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
  useDataCubePreviewQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { ChartContainer } from "../shared/containers";
import { Table } from "./table";
import { TableChart } from "./table-state";

// export const ChartTableVisualizationData = ({
//   dataSetIri,
//   chartConfig,
// }: {
//   dataSetIri: string;
//   chartConfig: TableConfig;
// }) => {
//   const locale = useLocale();

//   const [{ data: metaData }] = useDataCubePreviewQuery({
//     variables: { iri: dataSetIri, locale },
//   });

//   if (metaData && metaData.dataCubeByIri) {
//     return (
//       <ChartTableVisualization
//         dataSetIri={dataSetIri}
//         chartConfig={chartConfig}
//         measures={metaData.dataCubeByIri.measures}
//       />
//     );
//   } else {
//     return <Loading />;
//   }
// };
export const ChartTableVisualization = ({
  dataSetIri,
  chartConfig,
}: // measures,
{
  dataSetIri: string;
  chartConfig: TableConfig;
  // measures: ComponentFieldsFragment[];
}) => {
  const locale = useLocale();

  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [], //measures.map((d) => d.iri),
      filters: chartConfig.filters,
    },
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartTable
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          settings={chartConfig.settings}
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
    fields,
    settings,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: TableFields;
    settings: TableSettings;
  }) => {
    return (
      <TableChart
        data={observations.slice(0, 200)}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        settings={settings}
      >
        <ChartContainer>
          <Table></Table>
        </ChartContainer>
      </TableChart>
    );
  }
);
