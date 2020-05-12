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
  chartConfigOptionsUISpec,
  EncodingSpec,
  EncodingField,
  EncodingOptions,
} from "../domain/chart-config-ui-options";

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
          <ActiveFieldSwitch state={state} metaData={meta} />
        ) : (
          <EmptyRightPanel state={state} />
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const ActiveFieldSwitch = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { activeField } = state;

  const encodings =
    chartConfigOptionsUISpec[state.chartConfig.chartType].encodings;
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
  // FIXME: activeField and encodingField should match? remove type assertion
  if (
    !encodings.map((e) => e.field).includes(activeField as EncodingField) &&
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
      field={activeField} // FIXME: or encoding.field?
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
            label={getFieldLabelHint[encoding.field]}
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
              encodingOptions={encoding.options}
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
  encodingOptions,
  disabled = false,
}: {
  field: string;
  chartType: ChartType;
  encodingOptions: EncodingOptions;
  disabled?: boolean;
}) => {
  return (
    <>
      {/* FIXME: improve use of encodingOptions to get chart options */}
      {/* TODO: Add sorting options */}
      {encodingOptions?.map((e) => e.field).includes("chartSubType") &&
        chartType === "column" && (
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
      {encodingOptions?.map((e) => e.field).includes("color") && (
        <ColorPalette disabled={disabled} field={field}></ColorPalette>
      )}
    </>
  );
};
