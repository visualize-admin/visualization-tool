import { Trans } from "@lingui/macro";
import { useSelect } from "downshift";
import { get } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  disabled?: boolean;
};

export const ColorRamp = ({
  colorInterpolator,
  nbClass = 512,
  width = 148,
  height = 28,
  disabled = false,
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
      canvas.style.opacity = disabled ? "0.5" : "1";

      const [widthPerClass, numberOfSteps] =
        nbClass > width ? [1, width] : [width / nbClass, nbClass];

      for (let i = 0; i < numberOfSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (numberOfSteps - 1));
        context.fillRect(widthPerClass * i, 0, widthPerClass, height);
      }
    }
  }, [colorInterpolator, nbClass, width, height, disabled]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

type MapField = "areaLayer";
type MapPath = "palette";

type ColorRampFieldProps = Omit<ColorRampProps, "colorInterpolator"> & {
  field: MapField;
  path: MapPath;
};

// Currently only usable in areaLayer (map chart)!
export const ColorRampField = ({
  field,
  path,
  disabled,
  nbClass,
}: ColorRampFieldProps) => {
  const [state, dispatch] = useConfiguratorState();

  const { palettes, defaultPalette } = useMemo(() => {
    const palettes = [...divergingPalettes, ...sequentialPalettes];
    const defaultPalette = sequentialPalettes.find(
      (d) => d.value === "oranges"
    );

    return { palettes, defaultPalette };
  }, []);

  const currentPaletteName = get(
    state,
    `chartConfig.fields.${field}.${path}`
  ) as DivergingPaletteType | SequentialPaletteType;

  const currentPalette =
    palettes.find((d) => d.value === currentPaletteName) ||
    sequentialPalettes[0];

  const onSelectedItemChange = useCallback(
    ({ selectedItem }) => {
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
    [dispatch, field, path]
  );

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: palettes,
    defaultSelectedItem: defaultPalette,
    onSelectedItemChange,
  });

  return (
    <Box pb={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label disabled={disabled} smaller {...getLabelProps()}>
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Button
        variant="selectColorPicker"
        {...getToggleButtonProps()}
        sx={{ cursor: "pointer" }}
      >
        {state.state === "CONFIGURING_CHART" && (
          <>
            <ColorRamp
              colorInterpolator={currentPalette.interpolator}
              nbClass={nbClass}
              disabled={disabled}
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
                itemProps={getItemProps({ item: d, index: i })}
                highlighted={i === highlightedIndex}
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
                itemProps={getItemProps({
                  item: d,
                  index: i + divergingPalettes.length,
                })}
                highlighted={i + divergingPalettes.length === highlightedIndex}
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
  itemProps: any;
  highlighted?: boolean;
  nbClass?: number;
}) => {
  const { palette, itemProps, highlighted, nbClass } = props;
  const backgroundColor = highlighted ? "monochrome200" : "monochrome100";

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
