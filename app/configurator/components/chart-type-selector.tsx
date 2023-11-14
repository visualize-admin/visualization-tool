import { Trans, t } from "@lingui/macro";
import {
  Box,
  BoxProps,
  ButtonBase,
  Divider,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { SyntheticEvent } from "react";

import {
  comboChartTypes,
  getPossibleChartTypes,
  regularChartTypes,
} from "@/charts";
import Flex from "@/components/flex";
import { Hint } from "@/components/hint";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  getChartConfig,
} from "@/config-types";
import { ControlSectionSkeleton } from "@/configurator/components/chart-controls/section";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { FieldProps, useChartType } from "@/configurator/config-form";
import { useComponentsWithHierarchiesQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

const useSelectionButtonStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "86px",
    height: "64px",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    transition: "all .2s",
    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "& svg": {
      color: theme.palette.primary.main,
    },
  },
  checked: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    "& svg": {
      color: "white",
    },
  },
  disabled: {
    cursor: "initial",
    "& svg": {
      color: theme.palette.grey[500],
    },
  },
}));

export const ChartTypeSelectionButton = ({
  label,
  value,
  checked,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => void;
} & FieldProps) => {
  const classes = useSelectionButtonStyles();
  return (
    <ButtonBase
      tabIndex={0}
      value={value}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        classes.root,
        disabled ? classes.disabled : null,
        checked ? classes.checked : null
      )}
    >
      <Icon size={24} name={getIconName(label)} />
      <Typography
        variant="caption"
        sx={{
          color: disabled ? "text.primary" : "inherit",
          mt: 1,
        }}
      >
        {getFieldLabel(label)}
      </Typography>
    </ButtonBase>
  );
};

export const ChartTypeSelector = ({
  state,
  type = "edit",
  showHelp,
  chartKey,
  ...props
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing;
  type?: "add" | "edit";
  showHelp?: boolean;
  chartKey: string;
} & BoxProps) => {
  const locale = useLocale();
  const chartConfig = getChartConfig(state);
  const [{ data }] = useComponentsWithHierarchiesQuery({
    variables: {
      iri: chartConfig.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
  });
  const { value: chartType, onChange: onChangeChartType } = useChartType(
    chartKey,
    type,
    data?.dataCubeByIri?.dimensions ?? [],
    data?.dataCubeByIri?.measures ?? []
  );

  const onClick = React.useCallback(
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

  if (!data?.dataCubeByIri) {
    return <ControlSectionSkeleton />;
  }

  const possibleChartTypes = getPossibleChartTypes({
    dimensions: data.dataCubeByIri.dimensions,
    measures: data.dataCubeByIri.measures,
  });

  return (
    <Box {...props}>
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
            <Divider />
            <ChartTypeSelectorMenu
              type={type}
              title={t({
                id: "controls.chart.category.regular",
                message: "Regular",
              })}
              chartType={chartType}
              chartTypes={regularChartTypes}
              possibleChartTypes={possibleChartTypes}
              onClick={onClick}
              testId="chart-type-selector-regular"
            />
            <Divider />
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
              onClick={onClick}
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
        {titleHint && <WarnIconTooltip title={titleHint} />}
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
          <ChartTypeSelectionButton
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

type WarnIconTooltipProps = {
  title: NonNullable<React.ReactNode>;
};

const WarnIconTooltip = (props: WarnIconTooltipProps) => {
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
        <Icon
          name="exclamation"
          size={16}
          viewBox="0, 0, 18, 18"
          className={iconStyles.icon}
        />
      </Typography>
    </Tooltip>
  );
};
