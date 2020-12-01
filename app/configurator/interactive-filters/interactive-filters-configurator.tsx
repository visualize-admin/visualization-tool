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

import {
  ConfiguratorStateDescribingChart,
  InteractiveFilters,
} from "../config-types";
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
        {/* Time */}
        {timeDimension && state.chartConfig.chartType === "line" && (
          <ControlSectionContent side="left">
            <InteractiveFilterTabField
              path="time"
              value={state.chartConfig.interactiveFilters.time.active}
              icon="x"
              label={timeDimension.label}
            ></InteractiveFilterTabField>
          </ControlSectionContent>
        )}
        {/* legend */}
        {segmentDimension && state.chartConfig.chartType === "line" && (
          <ControlSectionContent side="left">
            <InteractiveFilterTabField
              path="legend"
              value={state.chartConfig.interactiveFilters.legend.active}
              icon="segment"
              label={segmentDimension.label}
            ></InteractiveFilterTabField>
          </ControlSectionContent>
        )}
      </ControlSection>
    );
  } else {
    return <Loading />;
  }
};

const InteractiveFilterTabField = ({
  path,
  icon,
  label,
  value,
  ...tabProps
}: {
  path: "legend" | "time";
  value: boolean;
  disabled?: boolean;
  icon: IconName;
  label: ReactNode;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    if (
      state.state === "DESCRIBING_CHART" &&
      state.chartConfig.chartType === "line"
    ) {
      const newIFConfig = toggleInteractiveFilter(
        state.chartConfig.interactiveFilters,
        { path, value }
      );

      // update active field (right side)
      dispatch({
        type: "ACTIVE_FIELD_CHANGED",
        value: path,
      });
      // Activate and update config
      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newIFConfig,
      });
    }
  }, [dispatch, path, state, value]);

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
          iconName={getIconName(icon)}
          lowerLabel={label}
          checked={checked}
          withCheckbox
        />
      </ControlTabButton>
    </Box>
  );
};

// Actions
const toggleInteractiveFilter = produce(
  (
    IFConfig: InteractiveFilters,
    { path, value }: { path: "legend" | "time"; value: boolean }
  ): InteractiveFilters => {
    if (!IFConfig[path]) {
      return IFConfig;
    }
    IFConfig[path].active = !value;
    return IFConfig;
  }
);
