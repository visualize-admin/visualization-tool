import React, { memo } from "react";
import { AreaConfig, AreaFields } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { Areas } from "./charts-generic/areas";
import { AreaChart } from "./charts-generic/areas/areas-state";
import { AxisTime } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";
import { Loading, NoDataHint } from "./hint";

export const ChartAreasVisualization = ({
  dataSetIri,

  chartConfig
}: {
  dataSetIri: string;
  chartConfig: AreaConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME
      filters: chartConfig.filters
    }
  });

  const observations = data?.dataCubeByIri?.observations.data;

  if (data?.dataCubeByIri) {
    const { dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <>
        {/* <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        /> */}
        <ChartAreas
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        {/* <DataDownload
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        /> */}
      </>
    ) : (
      <NoDataHint />
    );
  } else if (observations && !observations.map(obs => obs.y).some(isNumber)) {
    return <NoDataHint />;
  } else {
    return <Loading />;
  }
};

export const ChartAreas = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: AreaFields;
  }) => {
    return (
      <AreaChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime />
            <AxisHeightLinear />
            <Areas />
          </ChartSvg>
        </ChartContainer>
        {fields.segment && <LegendColor symbol="square" />}
      </AreaChart>
    );
  }
);
