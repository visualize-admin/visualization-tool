import React, { memo } from "react";
import { PieFields } from "../domain";
import { PieConfig } from "../domain/config-types";
import { Observation } from "../domain/data";
import { A11yTable } from "./a11y-table";
import { Tooltip } from "./charts-generic/annotations";
import { ChartSvg } from "./charts-generic/containers";
import { Pie } from "./charts-generic/pie";
import { PieChart } from "./charts-generic/pie/pie-state";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import {
  useDataCubeObservationsQuery,
  ComponentFieldsFragment
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

export const ChartPieVisualization = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: PieConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.value.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters
    }
  });

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartPie
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <DataDownload
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
      </>
    ) : (
      <NoDataHint />
    );
  } else {
    return <Loading />;
  }
};

export const ChartPie = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: PieFields;
  }) => {
    return (
      <PieChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={1}
      >
        <ChartSvg>
          <Pie />
        </ChartSvg>
        {/* <Tooltip /> */}
      </PieChart>
    );
  }
);
