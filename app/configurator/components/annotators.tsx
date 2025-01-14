import { Trans } from "@lingui/macro";
import { Theme, Typography, TypographyProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartAnnotatorTabField,
  LayoutAnnotatorTabField,
} from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  isConfiguring,
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";

const useStyles = makeStyles<Theme, { interactive?: boolean }>({
  text: {
    cursor: ({ interactive }) => (interactive ? "pointer" : "text"),
    "&:hover": {
      textDecoration: ({ interactive }) => (interactive ? "underline" : "none"),
    },
  },
});

const getEmptyColor = (lighterColor?: boolean) => {
  return lighterColor ? "grey.500" : "secondary.main";
};

type Props = TypographyProps & {
  text: string;
  lighterColor?: boolean;
  smaller?: boolean;
};

export const Title = (props: Props) => {
  const { text, lighterColor, smaller, onClick, className, sx, ...rest } =
    props;
  const classes = useStyles({ interactive: !!onClick });
  return (
    <Typography
      {...rest}
      variant={smaller ? "h3" : "h2"}
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{
        color: text ? "text.primary" : getEmptyColor(lighterColor),
        wordBreak: "break-word",
        fontWeight: "normal",
        ...sx,
      }}
    >
      {text ? text : <Trans id="annotation.add.title">[ Title ]</Trans>}
    </Typography>
  );
};

export const Description = (props: Props) => {
  const { text, lighterColor, smaller, onClick, className, sx, ...rest } =
    props;
  const classes = useStyles({ interactive: !!onClick });
  return (
    <Typography
      {...rest}
      variant={smaller ? "body2" : "body1"}
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{
        color: text ? "text.primary" : getEmptyColor(lighterColor),
        wordBreak: "break-word",
        ...sx,
      }}
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
        <ChartAnnotatorTabField
          value="title"
          icon="text"
          emptyValueWarning={
            <Trans id="controls.annotator.add-title-warning">
              Please add a title
            </Trans>
          }
          mainLabel={getFieldLabel("title")}
        />
        <ChartAnnotatorTabField
          value="description"
          icon="description"
          emptyValueWarning={
            <Trans id="controls.annotator.add-description-warning">
              Please add a description
            </Trans>
          }
          mainLabel={getFieldLabel("description")}
        />
        <ChartAnnotatorTabField
          value="label"
          icon="layoutTab"
          emptyValueWarning={
            <Trans id="controls.annotator.add-tab-label-warning">
              Please add a tab label
            </Trans>
          }
          mainLabel={getFieldLabel("label")}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

export const LayoutAnnotator = () => {
  const locale = useLocale();
  const [state] = useConfiguratorState(isLayouting);
  const { title, description } = state.layout.meta;
  const disabled = !(title[locale] && description[locale]);

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded
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
        <LayoutAnnotatorTabField
          value="title"
          icon="text"
          emptyValueWarning={
            <Trans id="controls.annotator.add-title-warning">
              Please add a title
            </Trans>
          }
          mainLabel={getFieldLabel("title")}
        />
        <LayoutAnnotatorTabField
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
