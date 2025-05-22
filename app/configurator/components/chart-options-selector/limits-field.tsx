import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import get from "lodash/get";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { LegendItem } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import { Radio, RadioGroup, Switch } from "@/components/form";
import { ChartConfig } from "@/config-types";
import {
  getAxisDimension,
  getMaybeValidChartConfigLimit,
  getSupportsLimitSymbols,
  useChartConfigFilters,
} from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Dimension, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
import { getPalette } from "@/palettes";
import { Limit } from "@/rdf/limits";
import useEvent from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

const ColorPickerMenu = dynamic(
  () =>
    import("../chart-controls/color-picker").then((mod) => mod.ColorPickerMenu),
  { ssr: false }
);

export const LimitsField = ({
  chartConfig,
  dimensions,
  measure,
}: {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measure: Measure;
}) => {
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const filters = useChartConfigFilters(chartConfig);
  const onToggle = useEvent((checked: boolean, limit: Limit) => {
    const actionProps = {
      measureId: measure.id,
      related: limit.related.map((r) => ({
        dimensionId: r.dimensionId,
        value: r.value,
      })),
    };

    if (checked) {
      dispatch({
        type: "LIMIT_SET",
        value: { ...actionProps, color: "#ff0000", lineType: "solid" },
      });
    } else {
      dispatch({
        type: "LIMIT_REMOVE",
        value: actionProps,
      });
    }
  });
  const axisDimension = getAxisDimension({ chartConfig, dimensions });
  const availableLimitOptions = useMemo(() => {
    return measure.limits
      .map((limit) => {
        const {
          limit: maybeLimit,
          wouldBeValid,
          relatedAxisDimensionValueLabel,
        } = getMaybeValidChartConfigLimit({
          chartConfig,
          measureId: measure.id,
          axisDimension,
          limit,
          filters,
        });

        if (!wouldBeValid) {
          return;
        }

        const {
          color = "#ffffff",
          lineType = "solid",
          symbolType = "circle",
        } = maybeLimit ?? {};

        return {
          relatedAxisDimensionValueLabel,
          limit,
          maybeLimit,
          color,
          lineType,
          symbolType,
        };
      })
      .filter(truthy);
  }, [axisDimension, chartConfig, filters, measure.id, measure.limits]);

  const { data: userPalettes } = useUserPalettes();
  const paletteId = get(chartConfig, "fields.color.paletteId");
  const colors = getPalette({
    paletteId,
    fallbackPalette: userPalettes?.find((d) => d.paletteId === paletteId)
      ?.colors,
  });
  const supportsLimitSymbols = getSupportsLimitSymbols(chartConfig);

  return availableLimitOptions.length > 0 ? (
    <ControlSection collapse>
      <SectionTitle iconName="target">
        <Trans id="controls.section.targets-and-limit-values">
          Targets & limit values
        </Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset">
        {availableLimitOptions.map(
          (
            {
              relatedAxisDimensionValueLabel,
              maybeLimit,
              limit,
              color,
              lineType,
              symbolType,
            },
            i
          ) => {
            /** It means that the limit is rendered as overarching line, not tied
             * to any axis dimension value. */
            const hasNoAxisDimension =
              relatedAxisDimensionValueLabel === undefined;

            return (
              <Box key={i} sx={{ mb: 2 }}>
                <Flex
                  flexDirection="column"
                  sx={{
                    gap: 4,
                    mb:
                      limit.type === "value-range" || supportsLimitSymbols
                        ? 4
                        : 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Switch
                      id={`limit-${i}`}
                      label={t({
                        id: "controls.section.targets-and-limit-values.show-target",
                        message: "Show target",
                      })}
                      checked={!!maybeLimit}
                      onChange={(e) => {
                        onToggle(e.target.checked, limit);
                      }}
                    />
                  </Box>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <LegendItem
                      label={limit.name}
                      color={color}
                      symbol="square"
                    />
                    <ColorPickerMenu
                      colors={colors}
                      selectedHexColor={color}
                      onChange={(color) => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType,
                            symbolType,
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                  </Flex>
                </Flex>
                {limit.type === "single" && supportsLimitSymbols ? (
                  <div>
                    <Typography variant="h6" component="p" sx={{ mb: 2 }}>
                      <Trans id="controls.section.targets-and-limit-values.symbol-type">
                        Select symbol type
                      </Trans>
                    </Typography>
                    <RadioGroup>
                      <Radio
                        name={`limit-${i}-symbol-type-dot`}
                        label={t({ id: "controls.symbol.dot", message: "Dot" })}
                        value="dot"
                        checked={symbolType === "circle"}
                        onChange={() => {
                          dispatch({
                            type: "LIMIT_SET",
                            value: {
                              measureId: measure.id,
                              related: limit.related,
                              color,
                              lineType,
                              symbolType: "circle",
                            },
                          });
                        }}
                        disabled={!maybeLimit}
                      />
                      <Radio
                        name={`limit-${i}-symbol-type-cross`}
                        label={t({
                          id: "controls.symbol.cross",
                          message: "Cross",
                        })}
                        value="cross"
                        checked={symbolType === "cross"}
                        onChange={() => {
                          dispatch({
                            type: "LIMIT_SET",
                            value: {
                              measureId: measure.id,
                              related: limit.related,
                              color,
                              lineType,
                              symbolType: "cross",
                            },
                          });
                        }}
                        disabled={!maybeLimit}
                      />
                      <Radio
                        name={`limit-${i}-symbol-type-triangle`}
                        label={t({
                          id: "controls.symbol.triangle",
                          message: "Triangle",
                        })}
                        value="triangle"
                        checked={symbolType === "triangle"}
                        onChange={() => {
                          dispatch({
                            type: "LIMIT_SET",
                            value: {
                              measureId: measure.id,
                              related: limit.related,
                              color,
                              lineType,
                              symbolType: "triangle",
                            },
                          });
                        }}
                        disabled={!maybeLimit}
                      />
                    </RadioGroup>
                  </div>
                ) : null}
                {limit.type !== "single" ||
                !supportsLimitSymbols ||
                hasNoAxisDimension ? (
                  <div>
                    <Typography variant="body3" component="p" sx={{ my: 2 }}>
                      <Trans id="controls.section.targets-and-limit-values.line-type">
                        Select line type
                      </Trans>
                    </Typography>
                    <RadioGroup>
                      <Radio
                        name={`limit-${i}-line-type-solid`}
                        label={t({
                          id: "controls.line.solid",
                          message: "Solid",
                        })}
                        value="solid"
                        checked={lineType === "solid"}
                        onChange={() => {
                          dispatch({
                            type: "LIMIT_SET",
                            value: {
                              measureId: measure.id,
                              related: limit.related,
                              color,
                              lineType: "solid",
                              symbolType,
                            },
                          });
                        }}
                        disabled={!maybeLimit}
                      />
                      <Radio
                        name={`limit-${i}-line-type-dashed`}
                        label={t({
                          id: "controls.line.dashed",
                          message: "Dashed",
                        })}
                        value="dashed"
                        checked={lineType === "dashed"}
                        onChange={() => {
                          dispatch({
                            type: "LIMIT_SET",
                            value: {
                              measureId: measure.id,
                              related: limit.related,
                              color,
                              lineType: "dashed",
                              symbolType,
                            },
                          });
                        }}
                        disabled={!maybeLimit}
                      />
                    </RadioGroup>
                  </div>
                ) : null}
              </Box>
            );
          }
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};
