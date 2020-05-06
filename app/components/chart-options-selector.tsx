import { Trans } from "@lingui/macro";
import { Box, Flex } from "@theme-ui/components";
import React, { useEffect, useRef } from "react";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  getFieldComponentIri,
  getDimensionsByDimensionType,
} from "../domain";
import { getFieldLabel, getFieldLabelHint } from "../domain/helpers";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { IconName } from "../icons";
import { useLocale } from "../lib/use-locale";
import {
  SectionTitle,
  ControlSectionContent,
  ControlSection,
} from "./chart-controls/section";
import { EmptyRightPanel } from "./empty-right-panel";
import { ChartFieldField, ChartOptionField } from "./field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter,
} from "./filters";
import { FieldSetLegend } from "./form";
import { Loading } from "./hint";
import { ColorPalette } from "./chart-controls/color-palette";
import {
  chartConfigOptionsSpec,
  EncodingSpec,
} from "../domain/chart-config-options";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const meta = data.dataCubeByIri;

    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "auto",
          mb: 7,
        }}
      >
        {state.activeField ? (
          <ActiveFieldSwitchReworked state={state} metaData={meta} />
        ) : (
          <EmptyRightPanel state={state} />
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const ActiveFieldSwitchReworked = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { activeField } = state;

  const encodings =
    chartConfigOptionsSpec[state.chartConfig.chartType as "column"].encodings;
  const encoding = encodings.find(
    (e) => e.field === activeField
  ) as EncodingSpec;

  if (!activeField) {
    return null;
  }
  const activeFieldComponentIri = getFieldComponentIri(
    state.chartConfig.fields,
    activeField
  );

  // It's a dimension which is not mapped to an encoding field, so we show the filter!
  if (
    !encodings.map((e) => e.field).includes(activeField) &&
    !activeFieldComponentIri
  ) {
    return <Filter state={state} metaData={metaData} />;
  }

  const component = [...metaData.dimensions, ...metaData.measures].find(
    (d) => d.iri === activeFieldComponentIri
  );

  return (
    <EncodingOptionsPanel
      encoding={encoding}
      field={activeField}
      chartType={state.chartConfig.chartType}
      metaData={metaData}
      dimension={component}
    />
  );
};

const EncodingOptionsPanel = ({
  encoding,
  field,
  chartType,
  dimension,
  metaData,
}: {
  encoding: EncodingSpec;
  field: string;
  chartType: ChartType;
  dimension: { iri: string; label: string } | undefined;
  metaData: DataCubeMetadata;
}) => {
  const { measures, dimensions } = metaData;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [field]);

  return (
    <div
      key={`control-panel-${encoding.field}`}
      role="tabpanel"
      id={`control-panel-${encoding.field}`}
      aria-labelledby={`tab-${encoding.field}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <ControlSection>
        <SectionTitle iconName={encoding.field as IconName}>
          {getFieldLabel(encoding.field)}
        </SectionTitle>
        <ControlSectionContent side="right">
          <ChartFieldField
            field={encoding.field}
            label={getFieldLabelHint[encoding.field as "x"]} // FIXME: add other hints and remove type assertion
            optional={encoding.optional}
            options={getDimensionsByDimensionType({
              dimensionTypes: encoding.values,
              dimensions,
              measures,
            }).map((dimension) => ({
              value: dimension.iri,
              label: dimension.label,
            }))}
            dataSetMetadata={metaData}
          />
          {encoding.options && (
            <ChartFieldOptions
              disabled={!dimension}
              field={encoding.field}
              chartType={chartType}
            />
          )}
        </ControlSectionContent>
      </ControlSection>

      {encoding.filters && (
        <ControlSection>
          <SectionTitle disabled={!dimension} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SectionTitle>
          <ControlSectionContent side="right" as="fieldset">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {dimension && (
              <DimensionValuesMultiFilter
                key={dimension.iri}
                dimensionIri={dimension.iri}
                dataSetIri={metaData.iri}
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
    </div>
  );
};

// const ActiveFieldSwitch = ({
//   state,
//   metaData,
// }: {
//   state: ConfiguratorStateConfiguringChart;
//   metaData: DataCubeMetadata;
// }) => {
//   const { activeField } = state;

//   if (!activeField) {
//     return null;
//   }
//   // TODO: what to do with optional fields?
//   const activeFieldComponentIri = getFieldComponentIri(
//     state.chartConfig.fields,
//     activeField
//   );
//   // state.chartConfig.fields[activeField];

//   // It's an optional field
//   if (!activeFieldComponentIri && activeField === "segment") {
//     return (
//       <DimensionPanel
//         field={activeField}
//         chartType={state.chartConfig.chartType}
//         metaData={metaData}
//         dimension={undefined}
//       />
//     );
//   }

//   // It's a dimension which is not mapped to a field, so we show the filter!
//   if (!activeFieldComponentIri) {
//     return <Filter state={state} metaData={metaData} />;
//   }

//   const component = [...metaData.dimensions, ...metaData.measures].find(
//     (d) => d.iri === activeFieldComponentIri
//   );

//   return component?.__typename === "Measure" ? (
//     <MeasurePanel field={activeField} metaData={metaData} />
//   ) : (
//     <DimensionPanel
//       field={activeField}
//       chartType={state.chartConfig.chartType}
//       metaData={metaData}
//       dimension={component}
//     />
//   );
// };

// const DimensionPanel = ({
//   field,
//   chartType,
//   dimension,
//   metaData,
// }: {
//   field: string;
//   chartType: ChartType;
//   dimension: { iri: string; label: string } | undefined;
//   metaData: DataCubeMetadata;
// }) => {
//   const { dimensions } = metaData;
//   const panelRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (panelRef && panelRef.current) {
//       panelRef.current.focus();
//     }
//   }, [field]);
//   // const dimzzz = getDimensionsByDimensionType({
//   //   dimensionTypes: ["TemporalDimension", "Measure"],
//   //   measures,
//   //   dimensions,
//   // });
//   // console.log({ dimensions });
//   // console.log({ measures });
//   // console.log({ dimzzz });
//   return (
//     <div
//       key={`control-panel-${field}`}
//       role="tabpanel"
//       id={`control-panel-${field}`}
//       aria-labelledby={`tab-${field}`}
//       ref={panelRef}
//       tabIndex={-1}
//     >
//       <ControlSection>
//         <SectionTitle iconName={field as IconName}>
//           {getFieldLabel(field)}
//         </SectionTitle>
//         <ControlSectionContent side="right">
//           <ChartFieldField
//             field={field}
//             label={
//               <Trans id="controls.select.dimension">Select a dimension</Trans>
//             }
//             optional={chartType !== "pie" && field === "segment"} // FIXME: Should be a more robust optional tag
//             options={
//               field === "x" && (chartType === "line" || chartType === "area")
//                 ? dimensions.flatMap((dimension) => {
//                     return dimension.__typename === "TemporalDimension"
//                       ? [
//                           {
//                             value: dimension.iri,
//                             label: dimension.label,
//                           },
//                         ]
//                       : [];
//                   })
//                 : dimensions.map((dimension) => ({
//                     value: dimension.iri,
//                     label: dimension.label,
//                   }))
//             }
//             dataSetMetadata={metaData}
//           />
//           {field === "segment" && (
//             <ChartFieldOptions
//               disabled={!dimension}
//               field={field}
//               chartType={chartType}
//             />
//           )}
//         </ControlSectionContent>
//       </ControlSection>
//       <ControlSection>
//         <SectionTitle disabled={!dimension} iconName="filter">
//           <Trans id="controls.section.filter">Filter</Trans>
//         </SectionTitle>
//         <ControlSectionContent side="right" as="fieldset">
//           <legend style={{ display: "none" }}>
//             <Trans id="controls.section.filter">Filter</Trans>
//           </legend>
//           {dimension && (
//             <DimensionValuesMultiFilter
//               key={dimension.iri}
//               dimensionIri={dimension.iri}
//               dataSetIri={metaData.iri}
//             />
//           )}
//         </ControlSectionContent>
//       </ControlSection>
//     </div>
//   );
// };

// const MeasurePanel = ({
//   field,
//   metaData,
// }: {
//   field: string;
//   metaData: DataCubeMetadata;
// }) => {
//   const { measures } = metaData;
//   const panelRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (panelRef && panelRef.current) {
//       panelRef.current.focus();
//     }
//   }, [field]);
//   return (
//     <div
//       role="tabpanel"
//       id={`control-panel-${field}`}
//       aria-labelledby={`tab-${field}`}
//       ref={panelRef}
//       tabIndex={-1}
//       key={`control-panel-${field}`}
//     >
//       <ControlSection>
//         <SectionTitle iconName="y">{getFieldLabel(field)}</SectionTitle>
//         <ControlSectionContent side="right">
//           <ChartFieldField
//             field={field}
//             label={<Trans id="controls.select.measure">Select a measure</Trans>}
//             options={measures.map((measure) => ({
//               value: measure.iri,
//               label: measure.label,
//             }))}
//             dataSetMetadata={metaData}
//           />
//         </ControlSectionContent>
//       </ControlSection>
//     </div>
//   );
// };

const Filter = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions } = metaData;
  const activeDimension = dimensions.find(
    (dim) => dim.iri === state.activeField
  );
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);
  return (
    <div
      key={`filter-panel-${state.activeField}`}
      role="tabpanel"
      id={`filter-panel-${state.activeField}`}
      aria-labelledby={`tab-${state.activeField}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <ControlSection>
        <SectionTitle iconName="table">
          {activeDimension && activeDimension.label}
        </SectionTitle>
        <ControlSectionContent side="right" as="fieldset">
          <legend style={{ display: "none" }}>
            {activeDimension && activeDimension.label}
          </legend>
          {activeDimension && (
            <DimensionValuesSingleFilter
              dataSetIri={metaData.iri}
              dimensionIri={activeDimension.iri}
            />
          )}
        </ControlSectionContent>
      </ControlSection>
    </div>
  );
};

const ChartFieldOptions = ({
  field,
  chartType,
  disabled = false,
}: {
  field: string;
  chartType: ChartType;
  disabled?: boolean;
}) => {
  return (
    <>
      {chartType === "column" && (
        <Box as="fieldset" mt={2}>
          <FieldSetLegend
            legendTitle={
              <Trans id="controls.select.column.chart.type">Chart Type</Trans>
            }
          />
          <Flex sx={{ justifyContent: "flex-start" }} mt={1}>
            <ChartOptionField
              label="stacked"
              field={field}
              path="type"
              value={"stacked"}
              disabled={disabled}
            />
            <ChartOptionField
              label="grouped"
              field={field}
              path="type"
              value={"grouped"}
              disabled={disabled}
            />
          </Flex>
        </Box>
      )}
      <ColorPalette disabled={disabled} field={field}></ColorPalette>
    </>
  );
};
