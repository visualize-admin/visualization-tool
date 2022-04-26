import { Trans } from "@lingui/macro";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import React, { SyntheticEvent } from "react";

import { enabledChartTypes, getPossibleChartType } from "@/charts";
import { Hint, Loading } from "@/components/hint";
import { useEnsurePossibleFilters } from "@/configurator/components/chart-configurator";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  getFieldLabel,
  getIconName,
} from "@/configurator/components/ui-helpers";
import {
  FieldProps,
  useChartTypeSelectorField,
} from "@/configurator/config-form";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
} from "../config-types";

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
  return (
    <ButtonBase
      tabIndex={0}
      value={value}
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "86px",
        height: "86px",
        borderRadius: 1.5,

        backgroundColor: checked ? "primary.main" : "grey.100",
        color: checked
          ? "muted.colored"
          : disabled
          ? "grey.500"
          : "primary.main",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        cursor: disabled ? "initial" : "pointer",
        pointerEvents: disabled ? "none" : "initial",

        transition: "all .2s",

        ":hover": {
          backgroundColor: disabled
            ? "muted.colored"
            : checked
            ? "primary"
            : "muted.dark",
        },
      }}
    >
      <Icon size={48} name={getIconName(label)} />
      <Typography
        variant="body2"
        sx={{
          color: disabled ? "grey.600" : checked ? "grey.100" : "grey.700",
          fontSize: ["0.75rem", "0.75rem", "0.75rem"],
        }}
      >
        {getFieldLabel(label)}
      </Typography>
    </ButtonBase>
  );
};

const ChartTypeSelectorField = ({
  label,
  value,
  metaData,
  disabled,
  ...props
}: {
  label: string;
  value: string;
  metaData: DataCubeMetadata;
  disabled?: boolean;
}) => {
  const field = useChartTypeSelectorField({
    value,
    metaData,
  });

  return (
    <ChartTypeSelectionButton
      disabled={disabled}
      label={label}
      {...field}
    ></ChartTypeSelectionButton>
  );
};

export const ChartTypeSelector = ({
  state,
}: {
  state:
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateDescribingChart
    | ConfiguratorStatePublishing;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  const { fetching: possibleFiltersFetching } = useEnsurePossibleFilters({
    state,
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;
    const possibleChartTypes = getPossibleChartType({ meta: metaData });

    return (
      <ControlSection>
        <legend style={{ display: "none" }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </legend>
        <SectionTitle sx={{ mb: 1 }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
          {possibleFiltersFetching ? (
            <CircularProgress
              color="primary"
              size={12}
              sx={{ color: "hint.main", display: "inline-block", ml: 1 }}
            />
          ) : null}
        </SectionTitle>

        <ControlSectionContent side="left">
          {!possibleChartTypes ? (
            <Hint>
              <Trans id="hint.no.visualization.with.dataset">
                No visualization can be created with the selected dataset.
              </Trans>
            </Hint>
          ) : (
            <Box
              display="grid"
              sx={{
                gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
                gridGap: "0.75rem",
                mx: 4,
              }}
            >
              {enabledChartTypes.map((d) => (
                <ChartTypeSelectorField
                  key={d}
                  label={d}
                  value={d}
                  metaData={metaData}
                  disabled={!possibleChartTypes.includes(d)}
                />
              ))}
            </Box>
          )}
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <Loading />;
  }
};
