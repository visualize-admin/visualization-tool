import { Trans } from "@lingui/macro";
import { Box, ButtonBase, Typography } from "@mui/material";
import React, { SyntheticEvent } from "react";

import { enabledChartTypes, getPossibleChartType } from "@/charts";
import { useDataSource } from "@/components/data-source-menu";
import Flex from "@/components/flex";
import { Hint } from "@/components/hint";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
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
        height: "64px",
        borderRadius: 4,

        backgroundColor: checked ? "muted.dark" : "grey.100",
        color: checked ? "primary.main" : disabled ? "grey.500" : "grey.700",

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
      <Icon size={24} name={getIconName(label)} />
      <Typography
        variant="body2"
        sx={{
          color: disabled ? "grey.600" : "grey.700",
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
  const [dataSource] = useDataSource();
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: state.dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;
    const possibleChartTypes = getPossibleChartType({ meta: metaData });

    return (
      <ControlSection sx={{ position: "relative", width: "320px" }}>
        <legend style={{ display: "none" }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </legend>
        <Box sx={{ m: 4, textAlign: "center" }}>
          <Typography variant="body2">
            <Trans id="controls.switch.chart.type">
              Switch to another chart type while maintaining most filter
              settings.
            </Trans>
          </Typography>
        </Box>

        <ControlSectionContent side="left">
          {!possibleChartTypes ? (
            <Hint>
              <Trans id="hint.no.visualization.with.dataset">
                No visualization can be created with the selected dataset.
              </Trans>
            </Hint>
          ) : (
            <Flex sx={{ flexDirection: "column", gap: 5 }}>
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
              {/* TODO: Handle properly when chart composition is implemented */}
              {/* <Button disabled sx={{ mx: 4, mb: 2, justifyContent: "center" }}>
                <Trans id="controls.remove.visualization">
                  Remove this visualization
                </Trans>
              </Button> */}
            </Flex>
          )}
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <ControlSectionSkeleton />;
  }
};
