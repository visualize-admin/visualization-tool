import React, { memo } from "react";
import { ColumnConfig, ColumnFields } from "../domain/config-types";
import { Observation } from "../domain/data";
import { isNumber } from "../domain/helpers";
import { A11yTable } from "./a11y-table";
import { Tooltip } from "./charts-generic/annotations";
import { AxisHeightLinearMax, AxisWidthBand } from "./charts-generic/axis";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import {
  Columns,
  ColumnsGrouped,
  ColumnsStacked,
  Interaction,
  InteractionGrouped,
  InteractionStacked
} from "./charts-generic/columns";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { LegendColor } from "./charts-generic/legends";
import { DataDownload } from "./data-download";
import { Loading, NoDataHint } from "./hint";
import { ColumnChart } from "./charts-generic/columns/columns-state";
import {
  useDataCubeObservationsQuery,
  ComponentFieldsFragment
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

export const ChartColumnsVisualization = ({
  dataSetIri,
  chartConfig
}: {
  dataSetIri: string;
  chartConfig: ColumnConfig;
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
        <ChartColumns
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
  } else if (observations && !observations.map(obs => obs.y).some(isNumber)) {
    return <NoDataHint />;
  } else {
    return <Loading />;
  }
};

export const ChartColumns = memo(
  ({
    observations,
    dimensions,
    measures,
    fields
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: ColumnFields;
  }) => {
    return (
      <ColumnChart
        data={observations}
        fields={fields}
        measures={measures}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            {fields.segment && fields.segment.type === "stacked" ? (
              <AxisHeightLinearMax />
            ) : (
              <AxisHeightLinear />
            )}
            <AxisWidthBand />

            {!fields.segment ? (
              <>
                <Columns />
                {/* <Interaction /> */}
              </>
            ) : fields.segment.type === "stacked" ? (
              <>
                <ColumnsStacked />
                {/* <InteractionStacked /> */}
              </>
            ) : (
              <>
                <ColumnsGrouped />
                {/* <InteractionGrouped /> */}
              </>
            )}
          </ChartSvg>
          {/* <Tooltip /> */}
        </ChartContainer>

        {fields.segment && <LegendColor symbol="square" />}
      </ColumnChart>
    );
  }
);
