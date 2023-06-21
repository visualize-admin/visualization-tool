import { Trans } from "@lingui/macro";
import { Box, BoxProps, ButtonBase, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { SyntheticEvent } from "react";

import { enabledChartTypes, getPossibleChartType } from "@/charts";
import Flex from "@/components/flex";
import { Hint } from "@/components/hint";
import { ControlSectionSkeleton } from "@/configurator/components/chart-controls/section";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { FieldProps, useChartType } from "@/configurator/config-form";
import { useComponentsQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
} from "../../config-types";

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
  showHelp,
  sx,
  ...props
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing;
  showHelp?: boolean;
  sx?: BoxProps["sx"];
} & BoxProps) => {
  const locale = useLocale();
  const { value: chartType, onChange: onChangeChartType } = useChartType();
  const [{ data }] = useComponentsQuery({
    variables: {
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
  });

  if (!data?.dataCubeByIri) {
    return <ControlSectionSkeleton />;
  }

  const possibleChartTypes = getPossibleChartType({
    dimensions: data.dataCubeByIri.dimensions,
    measures: data.dataCubeByIri.measures,
  });

  return (
    <Box sx={sx} {...props}>
      <legend style={{ display: "none" }}>
        <Trans id="controls.select.chart.type">Chart Type</Trans>
      </legend>
      {showHelp !== false ? (
        <Box sx={{ m: 4, textAlign: "center" }}>
          <Typography variant="body2">
            <Trans id="controls.switch.chart.type">
              Switch to another chart type while maintaining most filter
              settings.
            </Trans>
          </Typography>
        </Box>
      ) : (
        false
      )}

      <div>
        {!possibleChartTypes ? (
          <Hint>
            <Trans id="hint.no.visualization.with.dataset">
              No visualization can be created with the selected dataset.
            </Trans>
          </Hint>
        ) : (
          <Flex sx={{ flexDirection: "column", gap: 5 }}>
            <Box
              data-testid="chart-type-selector"
              display="grid"
              sx={{
                gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
                gridGap: "0.75rem",
                mx: 2,
              }}
            >
              {enabledChartTypes.map((d) => (
                <ChartTypeSelectionButton
                  key={d}
                  label={d}
                  value={d}
                  checked={chartType === d}
                  disabled={!possibleChartTypes.includes(d)}
                  onClick={(e) =>
                    onChangeChartType(e.currentTarget.value as ChartType)
                  }
                />
              ))}
            </Box>
            {/* TODO: Handle properly when chart composition is implemented */}
            {/* <Button disabled sx={{ mx: 4, mb: 2, justifyContent: "center" }}>
                <Trans id="controls.remove.visualization">
                  Remove this visualization
                </Trans>
              </Button> */}
          </Flex>
        )}
      </div>
    </Box>
  );
};
