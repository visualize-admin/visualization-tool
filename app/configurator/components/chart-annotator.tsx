import { Trans } from "@lingui/macro";
import React from "react";
import { getFieldComponentIri } from "../../charts";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { ConfiguratorStateDescribingChart } from "../config-types";
import {
  SectionTitle,
  ControlSectionContent,
  ControlSection,
} from "./chart-controls/section";
import { AnnotatorTabField, InteractiveFilterCategoryTabField } from "./field";
import { getFieldLabel } from "./ui-helpers";

export const ChartAnnotator = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });
  const segmentDimensionIri = getFieldComponentIri(
    state.chartConfig.fields,
    "segment"
  );
  const segmentDimension = data?.dataCubeByIri.dimensions.find(
    (dim) => dim.iri === segmentDimensionIri
  );

  return (
    <>
      {/* Title & Description */}
      <ControlSection role="tablist" aria-labelledby="controls-design">
        <SectionTitle titleId="controls-design">
          <Trans id="controls.section.description">Annotate</Trans>
        </SectionTitle>
        <ControlSectionContent side="left">
          <AnnotatorTabField
            value={"title"}
            icon="title"
            label={getFieldLabel("title")}
          ></AnnotatorTabField>
          <AnnotatorTabField
            value={"description"}
            icon="description"
            label={getFieldLabel("description")}
          ></AnnotatorTabField>
        </ControlSectionContent>
      </ControlSection>

      {/* Filters */}
      {segmentDimension && (
        <ControlSection
          role="tablist"
          aria-labelledby="controls-interactive-filters"
        >
          <SectionTitle titleId="controls-interactive-filters">
            <Trans id="controls.section.interactive.filters">
              Add interactive filters
            </Trans>
          </SectionTitle>
          <ControlSectionContent side="left">
            <InteractiveFilterCategoryTabField
              value={state.chartConfig.interactiveFilters.legend.active}
              icon="segment"
              label={segmentDimension.label}
            ></InteractiveFilterCategoryTabField>
          </ControlSectionContent>
        </ControlSection>
      )}
    </>
  );
};
