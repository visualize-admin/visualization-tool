import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { memo, useMemo } from "react";
import { getFieldComponentIris, useObservations } from "../domain";
import { ColumnConfig, ColumnFields } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../domain/data";
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

export const ChartColumnsVisualization = ({
  dataSet,
  dimensions,
  measures,
  chartConfig
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  chartConfig: ColumnConfig;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    // debugger;
    const fieldIris = getFieldComponentIris(chartConfig.fields);
    const restDimensions = dimensions.reduce<{
      [k: string]: { componentIri: string };
    }>((acc, d, i) => {
      if (!fieldIris.has(d.component.iri.value)) {
        acc[`dim${i}`] = { componentIri: d.component.iri.value };
      }
      return acc;
    }, {});
    return { ...restDimensions, ...chartConfig.fields };
  }, [chartConfig.fields, dimensions]);

  const { data: observations } = useObservations({
    dataSet,
    dimensions,
    measures,
    fields: allFields,
    filters: chartConfig.filters
  });

  if (observations && observations.map(obs => obs.y).some(isNumber)) {
    return observations.length > 0 ? (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
        />
        <ChartColumns
          observations={observations}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
        />
        <DataDownload
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations}
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
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
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
