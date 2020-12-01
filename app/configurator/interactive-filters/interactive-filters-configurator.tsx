/* eslint-disable react/jsx-no-undef */
import { Trans } from "@lingui/macro";
import { ReactNode, useCallback } from "react";

import { Box } from "theme-ui";

import { getFieldComponentIri } from "../../charts";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { IconName } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import {
  ControlTabButton,
  ControlTabButtonInner,
} from "../components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { useInteractiveFilterField } from "../config-form";

import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";

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
  if (data?.dataCubeByIri) {
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
        {segmentDimension && state.chartConfig.chartType === "line" && (
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
  } else {
    return <Loading />;
  }
};

const InteractiveFilterLegendTabField = ({
  icon,
  label,
  value,
  ...tabProps
}: {
  value: boolean;
  disabled?: boolean;
  icon: IconName;
  label: ReactNode;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    dispatch({
      type: "INTERACTIVE_FILTER_LEGEND_CHANGED",
      value: !value,
    });
  }, [dispatch, value]);

  const checked = value === true;
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "default",
        my: "2px",
      }}
    >
      <ControlTabButton checked={checked} value={`${value}`} onClick={onClick}>
        <ControlTabButtonInner
          iconName={icon}
          lowerLabel={label}
          checked={checked}
          withCheckbox
        />
      </ControlTabButton>
    </Box>
  );
};
