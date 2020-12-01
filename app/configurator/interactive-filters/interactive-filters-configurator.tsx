import { Trans } from "@lingui/macro";
import { getFieldComponentIri } from "../../charts";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { InteractiveFilterLegendTabField } from "../components/field";
import { ConfiguratorStateDescribingChart } from "../config-types";

export const InteractiveFiltersConfigurator = ({
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
    <ControlSection
      role="tablist"
      aria-labelledby="controls-interactive-filters"
    >
      <SectionTitle titleId="controls-interactive-filters">
        <Trans id="controls.section.interactive.filters">
          Add interactive filters
        </Trans>
      </SectionTitle>
      {/* Time */}
      {state.chartConfig.chartType === "line" && (
        <ControlSectionContent side="left">
          {/* <InteractiveFilterLegendTabField
            value={state.chartConfig.interactiveFilters.legend.active}
            icon="segment"
            label={segmentDimension.label}
          ></InteractiveFilterLegendTabField> */}
        </ControlSectionContent>
      )}
      {/* legend */}
      {segmentDimension && (
        <ControlSectionContent side="left">
          <InteractiveFilterLegendTabField
            value={state.chartConfig.interactiveFilters.legend.active}
            icon="segment"
            label={segmentDimension.label}
          ></InteractiveFilterLegendTabField>
        </ControlSectionContent>
      )}
    </ControlSection>
  );
};
