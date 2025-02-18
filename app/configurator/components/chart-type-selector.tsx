import { t, Trans } from "@lingui/macro";
import { Box, BoxProps, Divider, Typography } from "@mui/material";
import { SyntheticEvent, useCallback } from "react";

import {
  comboChartTypes,
  getEnabledChartTypes,
  regularChartTypes,
} from "@/charts";
import Flex from "@/components/flex";
import { Hint } from "@/components/hint";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { TooltipTitle } from "@/components/tooltip-utils";
import { ChartType, ConfiguratorStatePublished } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { ControlSectionSkeleton } from "@/configurator/components/chart-controls/section";
import { IconButton } from "@/configurator/components/icon-button";
import { useAddOrEditChartType } from "@/configurator/config-form";
import { ConfiguratorStateWithChartConfigs } from "@/configurator/configurator-state";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

import { InfoIconTooltip } from "../../components/info-icon-tooltip";

type ChartTypeSelectorProps = {
  state: Exclude<ConfiguratorStateWithChartConfigs, ConfiguratorStatePublished>;
  type?: "add" | "edit";
  showHelp?: boolean;
  showComparisonCharts?: boolean;
  chartKey: string;
} & BoxProps;

export const ChartTypeSelector = (props: ChartTypeSelectorProps) => {
  const {
    state,
    type = "edit",
    showHelp,
    showComparisonCharts = true,
    chartKey,
    ...rest
  } = props;
  const locale = useLocale();
  const chartConfig = getChartConfig(state);
  const [{ data }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });
  const dimensions = data?.dataCubesComponents?.dimensions ?? [];
  const measures = data?.dataCubesComponents?.measures ?? [];
  const { value: chartType, addOrEditChartType } = useAddOrEditChartType(
    chartKey,
    type,
    dimensions,
    measures
  );

  const handleClick = useCallback(
    (e: SyntheticEvent<HTMLButtonElement, Event>) => {
      const newChartType = e.currentTarget.value as ChartType;

      // Disable triggering the change event if the chart type is the same,
      // only in edit mode; we should be able to add any possible chart type
      // in add mode.
      if (type === "edit" ? newChartType !== chartType : true) {
        addOrEditChartType(newChartType);
      }
    },
    [chartType, addOrEditChartType, type]
  );

  if (!data?.dataCubesComponents) {
    return <ControlSectionSkeleton />;
  }

  const { enabledChartTypes, possibleChartTypesDict } = getEnabledChartTypes({
    dimensions,
    measures,
    cubeCount: chartConfig.cubes.length,
  });

  return (
    <Box {...rest}>
      <legend style={{ display: "none" }}>
        <Trans id="controls.select.chart.type">Chart Type</Trans>
      </legend>
      {showHelp === false ? null : (
        <Box sx={{ m: 4, textAlign: "center" }}>
          <Typography variant="body2">
            {type === "add" ? (
              <Trans id="controls.add.chart">Add another chart.</Trans>
            ) : (
              <Trans id="controls.switch.chart.type">
                Switch to another chart type while maintaining most filter
                settings.
              </Trans>
            )}
          </Typography>
        </Box>
      )}
      <div>
        {enabledChartTypes.length === 0 ? (
          <Hint>
            <Trans id="hint.no.visualization.with.dataset">
              No visualization can be created with the selected dataset.
            </Trans>
          </Hint>
        ) : (
          <Flex sx={{ flexDirection: "column", gap: 3 }}>
            <ChartTypeSelectorMenu
              type={type}
              title={t({
                id: "controls.chart.category.regular",
                message: "Regular",
              })}
              currentChartType={chartType}
              chartTypes={regularChartTypes}
              possibleChartTypesDict={possibleChartTypesDict}
              onClick={handleClick}
              testId="chart-type-selector-regular"
            />
            {showComparisonCharts ? (
              <>
                <Divider sx={{ borderColor: "muted.main", mx: 2 }} />
                <ChartTypeSelectorMenu
                  type={type}
                  title={t({
                    id: "controls.chart.category.combo",
                    message: "Comparison",
                  })}
                  titleHint={t({
                    id: "controls.chart.category.combo.hint",
                    message:
                      "Comparison chart types combine several measures in a chart, helping to visualize their relationships or correlations, even when they have different units or scales.",
                  })}
                  currentChartType={chartType}
                  chartTypes={comboChartTypes}
                  possibleChartTypesDict={possibleChartTypesDict}
                  onClick={handleClick}
                  testId="chart-type-selector-combo"
                />
              </>
            ) : null}
          </Flex>
        )}
      </div>
    </Box>
  );
};

const ChartTypeSelectorMenu = ({
  type,
  title,
  titleHint,
  currentChartType,
  chartTypes,
  possibleChartTypesDict,
  onClick,
  testId,
}: {
  type: "add" | "edit";
  title: string;
  titleHint?: string;
  currentChartType: ChartType;
  chartTypes: ChartType[];
  possibleChartTypesDict: ReturnType<
    typeof getEnabledChartTypes
  >["possibleChartTypesDict"];
  onClick: (e: SyntheticEvent<HTMLButtonElement, Event>) => void;
  testId?: string;
}) => {
  return (
    <Flex sx={{ flexDirection: "column", gap: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          mx: "auto",
          color: "grey.800",
        }}
      >
        {title}
        {titleHint && <InfoIconTooltip title={titleHint} />}
      </Typography>
      <Box
        data-testid={testId}
        sx={{
          display: "grid",
          gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
          justifyItems: "center",
          gridGap: "0.75rem",
          mx: 2,
        }}
      >
        {chartTypes.map((chartType) => {
          const { enabled, message } = possibleChartTypesDict[chartType];
          return (
            <MaybeTooltip
              key={chartType}
              title={
                !enabled && message ? (
                  <TooltipTitle text={message} />
                ) : undefined
              }
              tooltipProps={{ placement: "right" }}
            >
              <div>
                <IconButton
                  label={chartType}
                  value={chartType}
                  checked={
                    type === "edit" ? currentChartType === chartType : false
                  }
                  disabled={!enabled}
                  onClick={onClick}
                />
              </div>
            </MaybeTooltip>
          );
        })}
      </Box>
    </Flex>
  );
};
