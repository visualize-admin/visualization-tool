import React, { memo } from "react";
import { PieFields } from "../domain";
import { PieConfig } from "../domain/config-types";
import { Observation } from "../domain/data";
import { A11yTable } from "./a11y-table";

import { ChartSvg, ChartContainer } from "./charts-generic/containers";
import { Pie } from "./charts-generic/pie";
import { PieChart } from "./charts-generic/pie/pie-state";
import { Loading, NoDataHint } from "./hint";
import {
  useDataCubeObservationsQuery,
  ComponentFieldsFragment,
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { LegendColor } from "./charts-generic/legends/color";
import { Tooltip } from "./charts-generic/annotations/tooltip";

export const ChartPieVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: PieConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters,
    },
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
    fields,
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
        aspectRatio={0.5}
      >
        <ChartContainer>
          <ChartSvg>
            <Pie />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        {fields.segment && <LegendColor symbol="square" />}
      </PieChart>
    );
  }
);
