import { t, Trans } from "@lingui/macro";
import { Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import { LegendItem } from "@/charts/shared/legend-color";
import { Flex } from "@/components/flex";
import { DisabledMessageIcon, Label } from "@/components/form";
import { CustomPaletteType } from "@/config-types";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import { Icon } from "@/icons";
import {
  ColorItem,
  createDivergingInterpolator,
  createSequentialInterpolator,
} from "@/palettes";
import { theme } from "@/themes/theme";
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
  title: string;
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
        <Label htmlFor="custom-color-palette-base">
          <Trans id="controls.custom-color-palettes.base" />
        </Label>
        {baseColor && (
          <ColorSelectionRow
            type={"sequential"}
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
  const { onAdd, onRemove, onUpdate, colorValues, title } = props;
  const classes = useStyles();

  const disabled =
    DIVERGING_MAX_ALLOWED_COLORS <= colorValues.length || title.length === 0;

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
          <Label htmlFor="custom-color-palette-start">
            <Trans id="controls.custom-color-palettes.start" />
          </Label>
          {startColorHex && (
            <ColorSelectionRow
              type={"diverging"}
              key={startColorHex.id}
              colorValues={[startColorHex]}
              {...startColorHex}
              onUpdate={onUpdate}
            />
          )}
        </Box>
        {midColorHex && (
          <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
            <Label htmlFor="custom-color-palette-mid">
              <Trans id="controls.custom-color-palettes.mid" />
            </Label>
            <ColorSelectionRow
              type={"diverging"}
              key={midColorHex.id}
              colorValues={[midColorHex]}
              {...midColorHex}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          </Box>
        )}
        <Box sx={{ fontSize: "1rem", pb: 2, maxWidth: 304 }}>
          <Label htmlFor="custom-color-palette-end">
            <Trans id="controls.custom-color-palettes.end" />
          </Label>
          {endColorHex && (
            <ColorSelectionRow
              type={"diverging"}
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
        disabled={disabled}
        startIcon={<Icon name="plus" />}
        onClick={() => onAdd()}
      >
        <Trans id="controls.custom-color-palettes.add-color">Add color</Trans>
      </Button>
    </>
  );
};

const CategoricalColorPaletteCreator = (props: ColorPaletteCreatorProps) => {
  const { onAdd, onRemove, onUpdate, colorValues, title } = props;
  const classes = useStyles();

  const disabled =
    CATEGORICAL_MAX_ALLOWED_COLORS <= colorValues.length || title.length === 0;

  return (
    <>
      {colorValues.length > 0 && (
        <Box className={classes.categoricalColorListContainer}>
          {colorValues.map((item) => (
            <ColorSelectionRow
              type={"categorical"}
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
        disabled={disabled}
        startIcon={<Icon name="plus" />}
        onClick={() => onAdd()}
      >
        <Trans id="controls.custom-color-palettes.add-color">Add color</Trans>
      </Button>
    </>
  );
};

type ColorSelectionRowProps = {
  colorValues: ColorItem[];
  type: CustomPaletteType["type"];
  onUpdate: (color: string, id: string) => void;
  onRemove?: (id: string) => void;
} & ColorItem;

const ColorSelectionRow = (props: ColorSelectionRowProps) => {
  const { id, color, colorValues, onRemove, onUpdate, type } = props;
  const classes = useStyles();

  const warningContrast = hasEnoughContrast(color);

  const getContrastWarning = () => {
    switch (type) {
      case "categorical":
        return t({
          id: "controls.custom-color-palettes.categorical-contrast-warning",
        });
      case "sequential":
        return t({
          id: "controls.custom-color-palettes.sequential-contrast-warning",
        });
      case "diverging":
        return t({
          id: "controls.custom-color-palettes.diverging-contrast-warning",
        });
      default:
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    }
  };

  return (
    <Box className={classes.colorItem}>
      <Flex className={classes.colorItemContent}>
        <LegendItem label={color} color={color} symbol="square" />
        <Flex sx={{ alignItems: "center", gap: 2 }}>
          {warningContrast && (
            <DisabledMessageIcon message={getContrastWarning()} />
          )}
          <ColorPickerMenu
            colorId={id}
            colors={colorValues}
            selectedHexColor={color}
            onChange={(color) => onUpdate(color, id)}
            onRemove={onRemove}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
