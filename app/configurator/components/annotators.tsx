import { Trans } from "@lingui/macro";
import { Theme, Typography, TypographyProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { MarkdownInheritFonts } from "@/components/markdown";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
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

const useStyles = makeStyles<Theme, { interactive?: boolean; empty: boolean }>(
  (theme) => ({
    text: {
      wordBreak: "break-word",
      color: ({ empty }) =>
        empty ? theme.palette.text.secondary : theme.palette.text.primary,
      cursor: ({ interactive }) => (interactive ? "pointer" : "text"),

      "&:hover": {
        textDecoration: ({ interactive }) =>
          interactive ? "underline" : "none",
      },

      "& > :last-child": {
        marginBottom: 0,
      },
    },
  })
);

type Props = TypographyProps & {
  text: string;
  smaller?: boolean;
};

export const Title = ({
  text,
  smaller,
  onClick,
  className,
  sx,
  ...rest
}: Props) => {
  const classes = useStyles({
    interactive: !!onClick,
    empty: !text,
  });

  return (
    <Typography
      {...rest}
      variant={smaller ? "h2" : "h1"}
      component="span"
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{ mb: smaller ? 1 : 4, fontWeight: smaller ? 400 : 700 }}
    >
      {text ? (
        <MarkdownInheritFonts>{text}</MarkdownInheritFonts>
      ) : (
        <Trans id="annotation.add.title">[ Title ]</Trans>
      )}
    </Typography>
  );
};

export const Description = ({
  text,
  smaller,
  onClick,
  className,
  sx,
  ...rest
}: Props) => {
  const classes = useStyles({
    interactive: !!onClick,
    empty: !text,
  });

  return (
    <Typography
      {...rest}
      variant="body2"
      component="span"
      className={clsx(classes.text, className)}
      onClick={onClick}
    >
      {text ? (
        <MarkdownInheritFonts>{text}</MarkdownInheritFonts>
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
  const labelsMissing = !(title[locale] && description[locale]);

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded={false}
    >
      <SectionTitle
        id="controls-design"
        warnMessage={
          labelsMissing ? (
            <Trans id="controls.section.title.warning">
              Please add a title or description.
            </Trans>
          ) : undefined
        }
      >
        <Trans id="controls.section.description">Title & Description</Trans>
      </SectionTitle>
      <ControlSectionContent gap="none" px="none">
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
  const labelsMissing = !(title[locale] && description[locale]);

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded
      hideTopBorder
    >
      <SectionTitle
        id="controls-design"
        warnMessage={
          labelsMissing ? (
            <Trans id="controls.section.title.warning">
              Please add a title or description.
            </Trans>
          ) : undefined
        }
      >
        <Trans id="controls.section.description">Title & Description</Trans>
      </SectionTitle>
      <ControlSectionContent gap="none" px="none">
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
