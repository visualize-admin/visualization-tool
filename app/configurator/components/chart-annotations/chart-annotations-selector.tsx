import { t, Trans } from "@lingui/macro";
import { Button, Typography } from "@mui/material";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import { useMemo } from "react";

import { Checkbox, MarkdownInput, Radio, RadioGroup } from "@/components/form";
import { Markdown } from "@/components/markdown";
import { useDisclosure } from "@/components/use-disclosure";
import { Annotation, AnnotationTarget } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { getDefaultHighlightAnnotation } from "@/configurator/components/chart-annotations/utils";
import { ControlTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfiguratorDrawer } from "@/configurator/components/drawers";
import { ColorPicker } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { isConfiguring } from "@/configurator/configurator-state";
import { Dimension } from "@/domain/data";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Locale } from "@/locales/locales";
import { useLocale, useOrderedLocales } from "@/locales/use-locale";
import { PRIMARY_COLOR } from "@/themes/palette";
import { useEvent } from "@/utils/use-event";

export const ChartAnnotationsSelector = () => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const activeField = chartConfig.activeField;
  const annotation = chartConfig.annotations.find(
    (annotation) => annotation.key === activeField
  );

  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      locale,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });

  const dimensions = useMemo(() => {
    return componentsData?.dataCubesComponents.dimensions ?? [];
  }, [componentsData]);

  const annotationLabel = useMemo(() => {
    return getAnnotationLabel({ annotation, dimensions });
  }, [annotation, dimensions]);

  const handleStyleTypeChange = useEvent(
    (highlightType: Annotation["highlightType"]) => {
      if (!annotation || annotation.highlightType === highlightType) {
        return;
      }

      dispatch({
        type: "CHART_ANNOTATION_HIGHLIGHT_TYPE_CHANGE",
        value: {
          key: annotation.key,
          highlightType,
        },
      });

      if (highlightType === "filled" && !annotation.color) {
        dispatch({
          type: "CHART_ANNOTATION_COLOR_CHANGE",
          value: {
            key: annotation.key,
            color: PRIMARY_COLOR,
          },
        });
      }
    }
  );

  const handleColorChange = useEvent((color: string) => {
    if (!annotation || annotation.color === color) {
      return;
    }

    dispatch({
      type: "CHART_ANNOTATION_COLOR_CHANGE",
      value: {
        key: annotation.key,
        color,
      },
    });
  });

  const handleDelete = useEvent(() => {
    if (!annotation) {
      return;
    }

    dispatch({
      type: "CHART_ANNOTATION_REMOVE",
      value: {
        key: annotation.key,
      },
    });
  });

  const handleClearText = useEvent((key: string) => {
    dispatch({
      type: "CHART_ANNOTATION_TEXT_CLEAR",
      value: {
        key,
      },
    });
  });

  const handleClose = useEvent(() => {
    if (!annotation) {
      return;
    }

    const defaultHighlightAnnotation = getDefaultHighlightAnnotation();

    if (
      isEqual(omit(annotation, "key"), omit(defaultHighlightAnnotation, "key"))
    ) {
      handleClearText(annotation.key);
    }

    dispatch({
      type: "CHART_ACTIVE_FIELD_CHANGE",
      value: undefined,
    });
  });

  const handleDefaultOpenChange = useEvent((defaultOpen: boolean) => {
    if (!annotation || annotation.defaultOpen === defaultOpen) {
      return;
    }

    dispatch({
      type: "CHART_ANNOTATION_DEFAULT_OPEN_CHANGE",
      value: {
        key: annotation.key,
        defaultOpen,
      },
    });
  });

  const drawerState = useDisclosure();

  if (!annotation) {
    return null;
  }

  const hasTargets = annotation.targets.length > 0;
  const hasText = Object.values(annotation.text).some((t) => t);
  const label = annotation.text[locale];

  return (
    <>
      <ControlSection hideTopBorder>
        <SectionTitle closable onClose={handleClose}>
          <Trans id="controls.annotations.highlight.section.element.title">
            Annotate element
          </Trans>
        </SectionTitle>
        <ControlSectionContent>
          <Typography variant="h6" component="p">
            {annotationLabel ||
              t({
                id: "controls.annotations.highlight.section.element.cta",
                message: "Select an element in the chart...",
              })}
          </Typography>
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SectionTitle>
          <Trans id="controls.annotations.highlight.section.style.title">
            Style
          </Trans>
        </SectionTitle>
        <ControlSectionContent gap="xl">
          <RadioGroup>
            <Radio
              label={t({ id: "controls.none", message: "None" })}
              value="none"
              checked={annotation.highlightType === "none"}
              disabled={!hasTargets}
              onChange={() => handleStyleTypeChange("none")}
            />
            <Radio
              label={t({ id: "controls.filled", message: "Filled" })}
              value="filled"
              checked={annotation.highlightType === "filled"}
              disabled={!hasTargets}
              onChange={() => handleStyleTypeChange("filled")}
            />
          </RadioGroup>
          {annotation.highlightType === "filled" && annotation.color && (
            <ColorPicker
              label={annotation.color}
              color={annotation.color}
              symbol="square"
              onChange={handleColorChange}
            />
          )}
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SectionTitle>
          <Trans id="controls.annotations.highlight.section.annotation.title">
            Annotation
          </Trans>
        </SectionTitle>
        <ControlSectionContent px="none">
          <ControlTab
            upperLabel={
              label
                ? undefined
                : t({
                    id: "controls.annotations.annotation",
                    message: "Annotation",
                  })
            }
            mainLabel={
              <Markdown>
                {label ||
                  t({
                    id: "controls.annotations.annotation.add.text",
                    message: "Add text...",
                  })}
              </Markdown>
            }
            icon="text"
            onClick={drawerState.open}
            value="text"
            disabled={!hasTargets}
          />
          <Button
            variant="text"
            color="primary"
            size="xs"
            disabled={!hasTargets || !hasText}
            onClick={() => handleClearText(annotation.key)}
            sx={{ width: "fit-content", ml: 4 }}
          >
            <Trans id="controls.annotations.annotation.clear-text">
              Clear text
            </Trans>
          </Button>
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SectionTitle>
          <Trans id="controls.annotations.highlight.section.display.title">
            Display
          </Trans>
        </SectionTitle>
        <ControlSectionContent>
          <Checkbox
            label={t({
              id: "controls.annotations.highlight.section.display.default-open",
              message: "Show open by default",
            })}
            checked={annotation.defaultOpen}
            disabled={!hasTargets || !hasText}
            onChange={() => handleDefaultOpenChange(!annotation.defaultOpen)}
          />
        </ControlSectionContent>
      </ControlSection>
      <AnnotationDrawer opened={drawerState.isOpen} close={drawerState.close} />
      <ControlSection hideTopBorder style={{ marginTop: "auto" }}>
        <ControlSectionContent>
          <Button size="sm" onClick={handleDelete}>
            <Trans id="controls.annotations.delete">Delete</Trans>
          </Button>
        </ControlSectionContent>
      </ControlSection>
    </>
  );
};

const AnnotationDrawer = ({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) => {
  const orderedLocales = useOrderedLocales();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const activeField = chartConfig.activeField;
  const annotation = chartConfig.annotations.find(
    (annotation) => annotation.key === activeField
  );

  const handleTextChange = useEvent((locale: Locale, value: string) => {
    if (!annotation) {
      return;
    }

    dispatch({
      type: "CHART_ANNOTATION_TEXT_CHANGE",
      value: {
        key: annotation.key,
        locale,
        value,
      },
    });
  });

  if (!annotation) {
    return null;
  }

  return (
    <ConfiguratorDrawer open={opened} hideBackdrop>
      <div
        role="tabpanel"
        id={`annotations-panel-${activeField}`}
        aria-labelledby={`annotations-tab-${activeField}`}
        tabIndex={-1}
        style={{ overflowX: "hidden", overflowY: "auto" }}
      >
        <ControlSection hideTopBorder>
          <SectionTitle onClose={close}>
            <Trans id="controls.annotations.highlight.section.annotation.title">
              Annotation
            </Trans>
          </SectionTitle>
          <ControlSectionContent>
            {orderedLocales.map((locale) => (
              <div key={`${locale}-${activeField}`}>
                <MarkdownInput
                  name={`annotation-${locale}`}
                  label={getFieldLabel(locale)}
                  value={annotation.text[locale]}
                  characterLimit={500}
                  disablePlugins={{
                    headings: true,
                  }}
                  disableToolbar={{
                    blockType: true,
                    listToggles: true,
                    link: true,
                  }}
                  onChange={(e) => {
                    handleTextChange(locale, e.currentTarget.value);
                  }}
                />
              </div>
            ))}
          </ControlSectionContent>
        </ControlSection>
      </div>
    </ConfiguratorDrawer>
  );
};

const getAnnotationLabel = ({
  annotation,
  dimensions,
}: {
  annotation?: Annotation;
  dimensions: Dimension[];
}) => {
  if (!annotation) {
    return;
  }

  return annotation.targets
    .map((target) => {
      if (target) {
        return getTargetLabel(target, { dimensions });
      }

      return "";
    })
    .sort()
    .join(", ");
};

const getTargetLabel = (
  target: AnnotationTarget,
  { dimensions }: { dimensions: Dimension[] }
) => {
  if (!target) {
    return;
  }

  const component = dimensions.find((d) => d.id === target.componentId);

  if (!component) {
    return;
  }

  const value = component.values.find((v) => v.value === target.value);

  if (!value) {
    return;
  }

  return `${component.label}: ${value.label}`;
};
