import { t } from "@lingui/macro";
import { Trans } from "@lingui/react";
import { Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import { LegendItem } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import { DisabledMessageIcon, Label } from "@/components/form";
import { CustomPaletteType } from "@/config-types";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import { Icon } from "@/icons";
import {
  ColorItem,
  createDivergingInterpolator,
  createSequentialInterpolator,
} from "@/palettes";
import { theme } from "@/themes/federal";
import { assert } from "@/utils/assert";
import { hasEnoughContrast } from "@/utils/color-palette-utils";

const ColorPickerMenu = dynamic(
  () =>
    import("../../../configurator/components/chart-controls/color-picker").then(
      (mod) => mod.ColorPickerMenu
    ),
  { ssr: false }
);

const CATEGORICAL_MAX_ALLOWED_COLORS = 26;
const DIVERGING_MAX_ALLOWED_COLORS = 3;

const useStyles = makeStyles({
  addColorButton: {
    minWidth: "fit-content",
    paddingLeft: 0,
  },
  categoricalColorListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  colorItem: {
    maxWidth: 304,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  colorItemContent: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});

type ColorPaletteCreatorProps = {
  onAdd: (color?: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (color: string, id: string) => void;
  colorValues: ColorItem[];
  type: CustomPaletteType["type"];
};

export const ColorPaletteCreator = (props: ColorPaletteCreatorProps) => {
  const { type } = props;
  switch (type) {
    case "diverging":
      return <DivergentColorPaletteCreator {...props} />;
    case "categorical":
      return <CategoricalColorPaletteCreator {...props} />;

    case "sequential":
      return <SequentialColorPaletteCreator {...props} />;
    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
};

const SequentialColorPaletteCreator = (props: ColorPaletteCreatorProps) => {
  const { onUpdate, onAdd, colorValues } = props;

  assert(
    colorValues.length > 0,
    "Sequential color palette must have at least one color"
  );
  const baseColor = colorValues[0];

  const colorResult = createSequentialInterpolator({
    endColorHex: baseColor.color,
  });

  const lastStartingColorRef = useRef(colorResult.startingColorHex);

  useEffect(() => {
    if (
      !colorResult.startingColorHex ||
      colorResult.startingColorHex === lastStartingColorRef.current
    ) {
      return;
    }

    lastStartingColorRef.current = colorResult.startingColorHex;

    if (colorValues[1]) {
      if (colorValues[1].color !== colorResult.startingColorHex) {
        onUpdate(colorResult.startingColorHex, colorValues[1].id);
      }
    } else {
      onAdd(colorResult.startingColorHex);
    }
  }, [colorResult.startingColorHex, colorValues, onAdd, onUpdate]);

  return (
    <Flex flexDirection={"column"} gap={2}>
      <Box>
        <ColorRamp
          height={24}
          width={304}
          colorInterpolator={colorResult.interpolator}
        />
      </Box>
      <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
        <Label htmlFor="custom-color-palette-base" smaller sx={{ mb: 1 }}>
          <Trans id="controls.custom-color-palettes.base" />
        </Label>
        {baseColor && (
          <ColorSelectionRow
            key={baseColor.id}
            colorValues={[baseColor]}
            {...baseColor}
            onUpdate={onUpdate}
          />
        )}
      </Box>
    </Flex>
  );
};

const DivergentColorPaletteCreator = (props: ColorPaletteCreatorProps) => {
  const { onAdd, onRemove, onUpdate, colorValues } = props;
  const classes = useStyles();

  const addColorCondition = DIVERGING_MAX_ALLOWED_COLORS <= colorValues.length;

  const [startColorHex, endColorHex, midColorHex] = colorValues;

  const colorResult = createDivergingInterpolator({
    endColorHex: endColorHex.color,
    startColorHex: startColorHex.color,
    options: {
      midColorHex: midColorHex?.color,
    },
  });

  return (
    <>
      <Flex flexDirection={"column"} gap={2}>
        <Box>
          <ColorRamp
            height={24}
            width={304}
            colorInterpolator={colorResult.interpolator}
          />
        </Box>
        <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
          <Label htmlFor="custom-color-palette-start" smaller sx={{ mb: 1 }}>
            <Trans id="controls.custom-color-palettes.start" />
          </Label>
          {startColorHex && (
            <ColorSelectionRow
              key={startColorHex.id}
              colorValues={[startColorHex]}
              {...startColorHex}
              onUpdate={onUpdate}
            />
          )}
        </Box>
        {midColorHex && (
          <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
            <Label htmlFor="custom-color-palette-mid" smaller sx={{ mb: 1 }}>
              <Trans id="controls.custom-color-palettes.mid" />
            </Label>
            <ColorSelectionRow
              key={midColorHex.id}
              colorValues={[midColorHex]}
              {...midColorHex}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          </Box>
        )}
        <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
          <Label htmlFor="custom-color-palette-end" smaller sx={{ mb: 1 }}>
            <Trans id="controls.custom-color-palettes.end" />
          </Label>
          {endColorHex && (
            <ColorSelectionRow
              key={endColorHex.id}
              colorValues={[endColorHex]}
              {...endColorHex}
              onUpdate={onUpdate}
            />
          )}
        </Box>
      </Flex>
      <Button
        variant="text"
        fullWidth
        className={classes.addColorButton}
        disabled={addColorCondition}
        startIcon={<Icon name="add" />}
        onClick={() => onAdd()}
      >
        <Trans id="controls.custom-color-palettes.add-color">Add color</Trans>
      </Button>
    </>
  );
};

const CategoricalColorPaletteCreator = (props: ColorPaletteCreatorProps) => {
  const { onAdd, onRemove, onUpdate, colorValues } = props;
  const classes = useStyles();

  return (
    <>
      {colorValues.length > 0 && (
        <Box className={classes.categoricalColorListContainer}>
          {colorValues.map((item) => (
            <ColorSelectionRow
              colorValues={colorValues}
              key={item.id}
              {...item}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </Box>
      )}

      <Button
        variant="text"
        fullWidth
        className={classes.addColorButton}
        disabled={CATEGORICAL_MAX_ALLOWED_COLORS <= colorValues.length}
        startIcon={<Icon name="add" />}
        onClick={() => onAdd()}
      >
        <Trans id="controls.custom-color-palettes.add-color">Add color</Trans>
      </Button>
    </>
  );
};

type ColorSelectionRowProps = {
  colorValues: ColorItem[];
  onUpdate: (color: string, id: string) => void;
  onRemove?: (id: string) => void;
} & ColorItem;

const ColorSelectionRow = (props: ColorSelectionRowProps) => {
  const { id, color, colorValues, onRemove, onUpdate } = props;
  const classes = useStyles();

  const warningContrast = hasEnoughContrast(color);

  return (
    <Box className={classes.colorItem}>
      <Flex className={classes.colorItemContent}>
        <LegendItem
          item={color}
          color={color}
          symbol="square"
          usage="colorPicker"
        />
        <Flex gap={2} alignItems={"center"}>
          {warningContrast && (
            <DisabledMessageIcon
              message={t({
                id: "controls.custom-color-palettes.contrast-warning",
                message:
                  "The selected color lacks sufficient contrast. Consider using a darker color for a sequential palette.",
              })}
            />
          )}
          <ColorPickerMenu
            colorId={id}
            colors={colorValues}
            selectedColor={color}
            onChange={(color) => onUpdate(color, id)}
            onRemove={onRemove}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
