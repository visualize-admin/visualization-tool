import { Trans, t } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Divider,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useCallback } from "react";

import {
  comboChartTypes,
  getPossibleChartTypes,
  regularChartTypes,
} from "@/charts";
import Flex from "@/components/flex";
import { Hint } from "@/components/hint";
import {
  ChartType,
  ConfiguratorStatePublished,
  getChartConfig,
} from "@/config-types";
import { ControlSectionSkeleton } from "@/configurator/components/chart-controls/section";
import { IconButton } from "@/configurator/components/icon-button";
import { useChartType } from "@/configurator/config-form";
import { ConfiguratorStateWithChartConfigs } from "@/configurator/configurator-state";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

type ChartTypeSelectorProps = {
  state: Exclude<ConfiguratorStateWithChartConfigs, ConfiguratorStatePublished>;
  type?: "add" | "edit";
  showHelp?: boolean;
  chartKey: string;
} & BoxProps;

export const ChartTypeSelector = (props: ChartTypeSelectorProps) => {
  const { state, type = "edit", showHelp, chartKey, ...rest } = props;
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
  const { value: chartType, onChange: onChangeChartType } = useChartType(
    chartKey,
    type,
    dimensions,
    measures
  );

  const handleClick = useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement, Event>) => {
      const newChartType = e.currentTarget.value as ChartType;

      // Disable triggering the change event if the chart type is the same,
      // only in edit mode; we should be able to add any possible chart type
      // in add mode.
      if (type === "edit" ? newChartType !== chartType : true) {
        onChangeChartType(newChartType);
      }
    },
    [chartType, onChangeChartType, type]
  );

  if (!data?.dataCubesComponents) {
    return <ControlSectionSkeleton />;
  }

  const possibleChartTypes = getPossibleChartTypes({
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
        {!possibleChartTypes ? (
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
              chartType={chartType}
              chartTypes={regularChartTypes}
              possibleChartTypes={possibleChartTypes}
              onClick={handleClick}
              testId="chart-type-selector-regular"
            />
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
              chartType={chartType}
              chartTypes={comboChartTypes}
              possibleChartTypes={possibleChartTypes}
              onClick={handleClick}
              testId="chart-type-selector-combo"
            />
          </Flex>
        )}
      </div>
    </Box>
  );
};

type ChartTypeSelectorMenuProps = {
  type: "add" | "edit";
  title: string;
  titleHint?: string;
  chartType: ChartType;
  chartTypes: ChartType[];
  possibleChartTypes: ChartType[];
  onClick: (e: React.SyntheticEvent<HTMLButtonElement, Event>) => void;
  testId?: string;
};

const ChartTypeSelectorMenu = (props: ChartTypeSelectorMenuProps) => {
  const {
    type,
    title,
    titleHint,
    chartType,
    chartTypes,
    possibleChartTypes,
    onClick,
    testId,
  } = props;

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
          gridGap: "0.75rem",
          mx: 2,
        }}
      >
        {chartTypes.map((d) => (
          <IconButton
            key={d}
            label={d}
            value={d}
            checked={type === "edit" ? chartType === d : false}
            disabled={!possibleChartTypes.includes(d)}
            onClick={onClick}
          />
        ))}
      </Box>
    </Flex>
  );
};

const useWarnIconStyles = makeStyles<Theme>((theme) => ({
  icon: {
    color: theme.palette.primary.main,
    pointerEvents: "auto",
  },
}));

type InfoIconTooltipProps = {
  title: NonNullable<React.ReactNode>;
};

const InfoIconTooltip = (props: InfoIconTooltipProps) => {
  const { title } = props;
  const iconStyles = useWarnIconStyles();

  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Typography variant="caption" color="secondary">
          {title}
        </Typography>
      }
      componentsProps={{
        tooltip: { sx: { width: 180, px: 2, py: 1, lineHeight: "18px" } },
      }}
    >
      <Typography>
        <Icon name="infoOutline" size={16} className={iconStyles.icon} />
      </Typography>
    </Tooltip>
  );
};
