/* eslint-disable react/jsx-no-undef */
import { Trans } from "@lingui/macro";
import produce from "immer";
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
import { getIconName } from "../components/ui-helpers";

import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { toggleInteractiveFilter } from "./interactive-filters-state";

export const InteractiveFiltersConfigurator = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });
  const timeDimensionIri = getFieldComponentIri(state.chartConfig.fields, "x");
  const segmentDimensionIri = getFieldComponentIri(
    state.chartConfig.fields,
    "segment"
  );
  if (data?.dataCubeByIri) {
    const timeDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === timeDimensionIri
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
        <ControlSectionContent side="left">
          {/* Time */}
          {timeDimension && state.chartConfig.chartType === "line" && (
            <InteractiveFilterTabField
              value="time"
              icon="x"
              label={timeDimension.label}
            ></InteractiveFilterTabField>
          )}
          {/* legend */}
          {segmentDimension && state.chartConfig.chartType === "line" && (
            <InteractiveFilterTabField
              value="legend"
              icon="segment"
              label={segmentDimension.label}
            ></InteractiveFilterTabField>
          )}
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <Loading />;
  }
};

const InteractiveFilterTabField = ({
  value,
  icon,
  label,
  ...tabProps
}: {
  value: "legend" | "time";
  disabled?: boolean;
  icon: IconName;
  label: ReactNode;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;

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
          iconName={getIconName(icon)}
          lowerLabel={label}
          checked={checked}
          isActive
          showIsActive
        />
      </ControlTabButton>
    </Box>
  );
};
