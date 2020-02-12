import React, { memo } from "react";
import { LineConfig, LineFields } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import { A11yTable } from "./a11y-table";
import { Ruler, Tooltip } from "./charts-generic/annotations";
import { AxisTime } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";
import {
  InteractionRuler,
  InteractionTooltip,
  Lines
} from "./charts-generic/lines";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { LineChart } from "./charts-generic/lines/lines-state";
import { useLocale } from "../lib/use-locale";
import {
  useDataCubeObservationsQuery,
  ComponentFieldsFragment
} from "../graphql/query-hooks";

export const ChartLinesVisualization = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: LineConfig;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
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
        <ChartLines
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

export const ChartLines = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: LineFields;
  }) => {
    return (
      <LineChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisTime />
            <Lines />
            {/* {fields.segment ? <InteractionRuler /> : <InteractionTooltip />} */}
          </ChartSvg>
          {/* {fields.segment ? <Ruler /> : <Tooltip />} */}
        </ChartContainer>

        {fields.segment && <LegendColor symbol="line" />}
      </LineChart>
    );
  }
);
