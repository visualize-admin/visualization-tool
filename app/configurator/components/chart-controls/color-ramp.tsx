import { Trans } from "@lingui/macro";
import { useSelect } from "downshift";
import { get } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import { Box, Button, Text } from "theme-ui";
import {
  DivergingPaletteType,
  SequentialPaletteType,
  useConfiguratorState,
} from "../..";
import { Label } from "../../../components/form";
import { Icon } from "../../../icons";
import { divergingPalettes, sequentialPalettes } from "../ui-helpers";
// Adapted from https://observablehq.com/@mbostock/color-ramp

type ColorRampProps = {
  colorInterpolator: (t: number) => string;
  nbClass?: number;
  width?: number;
  height?: number;
};

export const ColorRamp = ({
  colorInterpolator,
  nbClass = 512,
  width = 148,
  height = 28,
}: ColorRampProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, width, height);
      canvas.style.imageRendering = "-moz-crisp-edges";
      canvas.style.imageRendering = "pixelated";
      canvas.style.borderRadius = "2px";

      const [widthPerClass, numberOfSteps] =
        nbClass > width ? [1, width] : [width / nbClass, nbClass];

      for (let i = 0; i < numberOfSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (numberOfSteps - 1));
        context.fillRect(widthPerClass * i, 0, widthPerClass, height);
      }
    }
  }, [colorInterpolator, height, width, nbClass]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

type ColorRampFieldProps = Omit<ColorRampProps, "colorInterpolator"> & {
  field: string;
  path: string;
};

export const ColorRampField = ({
  field,
  path,
  nbClass,
}: ColorRampFieldProps) => {
  const [state, dispatch] = useConfiguratorState();

  const palettes = useMemo(
    () => [...divergingPalettes, ...sequentialPalettes],
    []
  );

  const currentPaletteName = get(
    state,
    `chartConfig.fields.${field}.${path}`
  ) as DivergingPaletteType | SequentialPaletteType;

  const currentPalette =
    palettes.find((d) => d.value === currentPaletteName) || palettes[0];

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: palettes,
    defaultSelectedItem: palettes.find((d) => d.value === "oranges"),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        dispatch({
          type: "CHART_OPTION_CHANGED",
          value: {
            field,
            path,
            value: selectedItem.value,
          },
        });
      }
    },
  });

  return (
    <Box pb={2}>
      <Label smaller {...getLabelProps()}>
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Button
        {...getToggleButtonProps()}
        sx={{
          color: "monochrome700",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bg: "monochrome100",
          p: 1,
          height: "40px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome500",
          ":hover": {
            bg: "monochrome100",
          },
          ":active": {
            bg: "monochrome100",
          },
          ":disabled": {
            cursor: "initial",
            bg: "muted",
          },
        }}
      >
        {state.state === "CONFIGURING_CHART" && (
          <>
            <ColorRamp
              colorInterpolator={currentPalette.interpolator}
              nbClass={nbClass}
            />
            <Icon name="unfold" />
          </>
        )}
      </Button>
      <Box {...getMenuProps()} sx={{ bg: "monochrome100" }}>
        {isOpen && (
          <>
            <Text as="div" variant="meta" sx={{ p: 1 }}>
              <Trans id="controls.color.palette.diverging">Diverging</Trans>
            </Text>
            {divergingPalettes.map((d, i) => (
              <PaletteRamp
                key={`diverging-${i}`}
                palette={d}
                backgroundColor={
                  i === highlightedIndex ? "monochrome200" : "monochrome100"
                }
                itemProps={getItemProps({ item: d, index: i })}
                nbClass={nbClass}
              />
            ))}
            <Text as="div" variant="meta" sx={{ p: 1 }}>
              <Trans id="controls.color.palette.sequential">Sequential</Trans>
            </Text>
            {sequentialPalettes.map((d, i) => (
              <PaletteRamp
                key={`sequential-${i}`}
                palette={d}
                backgroundColor={
                  i + divergingPalettes.length === highlightedIndex
                    ? "monochrome200"
                    : "monochrome100"
                }
                itemProps={getItemProps({
                  item: d,
                  index: i + divergingPalettes.length,
                })}
                nbClass={nbClass}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

const PaletteRamp = (props: {
  palette: {
    label: string;
    value: DivergingPaletteType | SequentialPaletteType;
    interpolator: (t: number) => string;
  };
  backgroundColor: string;
  itemProps: any;
  nbClass?: number;
}) => {
  const { palette, backgroundColor, nbClass, itemProps } = props;

  return (
    <Box sx={{ p: 1, cursor: "pointer", backgroundColor }}>
      <Box sx={{ backgroundColor }} {...itemProps}>
        <ColorRamp
          key={`option-${palette.value}`}
          colorInterpolator={palette.interpolator}
          nbClass={nbClass}
        />
      </Box>
    </Box>
  );
};
