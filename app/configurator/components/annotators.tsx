import { Trans } from "@lingui/macro";
import { Theme, Typography, TypographyProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { getChartConfig } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";

const useStyles = makeStyles<Theme, { hoverable?: boolean }>({
  text: {
    marginBottom: 4,
    cursor: "pointer",

    "&:hover": {
      textDecoration: ({ hoverable }) => (hoverable ? "underline" : "none"),
    },
  },
});

const getEmptyColor = (lighterColor?: boolean) => {
  return lighterColor ? "grey.500" : "secondary.main";
};

type Props = TypographyProps & {
  text: string;
  lighterColor?: boolean;
};

export const Title = (props: Props) => {
  const { text, lighterColor, onClick, className, sx, ...rest } = props;
  const classes = useStyles({ hoverable: !!onClick });

  return (
    <Typography
      {...rest}
      variant="h2"
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{ color: text ? text : getEmptyColor(lighterColor), ...sx }}
    >
      {text ? text : <Trans id="annotation.add.title">[ Title ]</Trans>}
    </Typography>
  );
};

export const Description = (props: Props) => {
  const { text, lighterColor, onClick, className, sx, ...rest } = props;
  const classes = useStyles({ hoverable: !!onClick });

  return (
    <Typography
      {...rest}
      variant="body1"
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{ color: text ? text : getEmptyColor(lighterColor), ...sx }}
    >
      {text ? (
        text
      ) : (
        <Trans id="annotation.add.description">[ Description ]</Trans>
      )}
    </Typography>
  );
};

export const ChartAnnotator = () => {
  const locale = useLocale();
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const { title, description } = chartConfig.meta;
  const disabled = !(title[locale] && description[locale]);

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded={false}
    >
      <SubsectionTitle
        titleId="controls-design"
        disabled={disabled}
        warnMessage={
          disabled ? (
            <Trans id="controls.section.title.warning">
              Please add a title or description.
            </Trans>
          ) : undefined
        }
        gutterBottom={false}
      >
        <Trans id="controls.section.description">Title & Description</Trans>
      </SubsectionTitle>
      <ControlSectionContent px="small" gap="none">
        <AnnotatorTabField
          value="title"
          icon="text"
          emptyValueWarning={
            <Trans id="controls.annotator.add-title-warning">
              Please add a title
            </Trans>
          }
          mainLabel={getFieldLabel("title")}
        />
        <AnnotatorTabField
          value="description"
          icon="description"
          emptyValueWarning={
            <Trans id="controls.annotator.add-description-warning">
              Please add a description
            </Trans>
          }
          mainLabel={getFieldLabel("description")}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

export const ConfiguratorAnnotator = () => {};