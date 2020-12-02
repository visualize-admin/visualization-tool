import { Trans } from "@lingui/macro";
import get from "lodash/get";
import { ReactNode, useCallback } from "react";
import { Box } from "theme-ui";
import { getFieldComponentIri } from "../../charts";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
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
    // Are dimensions available?
    const timeDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === timeDimensionIri
    );
    const segmentDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === segmentDimensionIri
    );

    // Can chart type have these options?
    const canFilterLegend = chartConfigOptionsUISpec[
      state.chartConfig.chartType
    ].interactiveFilters.includes("legend");
    const canFilterTime = chartConfigOptionsUISpec[
      state.chartConfig.chartType
    ].interactiveFilters.includes("time");

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
          {timeDimension && canFilterTime && (
            <InteractiveFilterTabField
              value="time"
              icon="time"
              label={timeDimension.label}
            ></InteractiveFilterTabField>
          )}
          {/* legend */}
          {segmentDimension && canFilterLegend && (
            <InteractiveFilterTabField
              value="legend"
              icon="segments"
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

  const optionActive =
    state.state === "DESCRIBING_CHART"
      ? get(state, `chartConfig.interactiveFilters["${value}"].active`, "")
      : "";

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
          isActive={optionActive}
          showIsActive
        />
      </ControlTabButton>
    </Box>
  );
};
