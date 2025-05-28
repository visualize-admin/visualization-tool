import { useEvent } from "@dnd-kit/utilities";
import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ChangeEvent, useCallback, useRef, useState } from "react";

import { Flex } from "@/components/flex";
import { RadioGroup } from "@/components/form";
import { Input, Radio } from "@/components/form";
import { BackButton, CustomPaletteType } from "@/configurator";
import { ColorItem, ColorsByType, getDefaultColorValues } from "@/palettes";
import { theme } from "@/themes/theme";
import {
  createCustomColorPalette,
  updateCustomColorPalette,
} from "@/utils/chart-config/api";
import { createColorId } from "@/utils/color-palette-utils";
import { useMutate } from "@/utils/use-fetch-data";

import { ColorPaletteExample } from "./color-palette-examples";
import { ColorPaletteCreator } from "./color-palette-types";

const useStyles = makeStyles({
  root: {
    width: "100%",
    padding: "8px 0px",
  },
  backButton: {
    width: "fit-content",
  },
  colorPickerContainer: {
    gap: theme.spacing(5),
    width: "510px",
    paddingLeft: theme.spacing(4),
  },
  inputContainer: {
    width: "304px",
  },
  addColorButton: {
    minWidth: "fit-content",
    paddingLeft: 0,
  },
  saveButtonContainer: {
    marginTop: theme.spacing(2),
  },
});

type ProfileColorPaletteProps = {
  onBack: () => void;
  palette?: CustomPaletteType;
  formMode: "add" | "edit";
  customColorPalettes?: CustomPaletteType[];
};

export const ProfileColorPaletteForm = ({
  onBack,
  palette,
  formMode,
  customColorPalettes,
}: ProfileColorPaletteProps) => {
  const [type, setType] = useState<CustomPaletteType["type"]>(
    palette?.type || "categorical"
  );
  const [colorValues, setColorValues] = useState<ColorItem[]>(() =>
    getDefaultColorValues(type, palette?.colors || [])
  );

  const colorsByTypeRef = useRef<ColorsByType>({
    categorical: getDefaultColorValues("categorical", palette?.colors || []),
    sequential: getDefaultColorValues("sequential", palette?.colors || []),
    diverging: getDefaultColorValues("diverging", palette?.colors || []),
  });

  const [isNotAvailable, setIsNotAvailable] = useState(false);
  const [titleInput, setTitleInput] = useState<string>(palette?.name || "");

  const classes = useStyles();

  const createColorPalette = useMutate(createCustomColorPalette);
  const updateColorPalette = useMutate(updateCustomColorPalette);

  const updateColor = useCallback(
    (color: string, id: string) => {
      setColorValues((prevColors) => {
        const newColors = prevColors.map((oldColor) =>
          oldColor.id === id ? { ...oldColor, color } : oldColor
        );
        colorsByTypeRef.current[type] = newColors;
        return newColors;
      });
    },
    [type]
  );

  const removeColor = useCallback(
    (colorId: string) => {
      setColorValues((prevColors) => {
        const newColors = prevColors.filter(
          (oldColor) => oldColor.id !== colorId
        );
        colorsByTypeRef.current[type] = newColors;
        return newColors;
      });
    },
    [type]
  );

  const addColor = useCallback(
    (color?: string) => {
      setColorValues((prevColors) => {
        const newColors = [
          ...prevColors,
          { color: color ?? "#000000", id: createColorId() },
        ];
        colorsByTypeRef.current[type] = newColors;
        return newColors;
      });
    },
    [type]
  );

  const handleTypeChange = useCallback(
    (newType: CustomPaletteType["type"]) => {
      setType(newType);

      const currentColors = colorValues.map((item) => item.color);

      const newColorValues = getDefaultColorValues(newType, currentColors);

      colorsByTypeRef.current[newType] = newColorValues;
      setColorValues(newColorValues);
    },
    [colorValues]
  );

  const saveColorPalette = useEvent(async () => {
    const titleExistsAlready = customColorPalettes?.find(
      (palette) => palette.name === titleInput
    );

    if (titleExistsAlready && formMode === "add") {
      setIsNotAvailable(true);
    } else {
      setIsNotAvailable(false);
      if (palette) {
        await updateColorPalette.mutate({
          paletteId: palette.paletteId,
          name: titleInput,
          colors: colorValues.map((c) => c.color),
          type,
        });
      } else {
        await createColorPalette.mutate({
          name: titleInput,
          colors: colorValues.map((c) => c.color),
          type,
        });
      }
      onBack();
    }
  });

  const noChanges =
    palette?.name === titleInput &&
    palette?.colors?.length === colorValues.length &&
    palette?.colors?.every(
      (color, index) => color === colorValues[index].color
    );

  const captions: Record<CustomPaletteType["type"], string> = {
    sequential: t({
      id: "controls.custom-color-palettes.caption-sequential",
      message:
        "Select a dark endpoint color for a strong contrast between low and high values; the light color is calculated automatically. Sequential color palettes are suitable for ordered data such as temperatures or population densities.",
    }),
    diverging: t({
      id: "controls.custom-color-palettes.caption-diverging",
      message:
        "Choose contrasting colors for the start and end points. These colors will help visually separate extreme values. Diverging palettes are ideal for data with a meaningful midpoint, such as zero or an average.",
    }),
    categorical: t({
      id: "controls.custom-color-palettes.caption-categorical",
      message:
        "Use distinct, high-contrast colors. Avoid using too many colors, maximum 5–7. Apply sequential palettes for ordered data and diverging palettes for extremes.",
    }),
  };

  return (
    <Flex flexDirection="column" gap={8}>
      <BackButton className={classes.backButton} onClick={onBack}>
        <Trans id="login.profile.my-color-palettes.create.back-button">
          My palette
        </Trans>
      </BackButton>
      <Flex flexDirection="column" className={classes.colorPickerContainer}>
        <ColorPaletteTypeSelector
          onChange={handleTypeChange}
          selectedType={type}
        />
        <Typography variant="body2">{captions[type]}</Typography>

        <Box className={classes.inputContainer}>
          <Flex flexDirection="column">
            <Input
              error={isNotAvailable}
              label={t({ id: "controls.custom-color-palettes.title" })}
              name="custom-color-palette-title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
            {isNotAvailable && (
              <Typography color="error.main" variant="caption">
                <Trans id="controls.custom-color-palettes.title-unavailable">
                  This name is already in use. Please choose a unique name for
                  your color palette.
                </Trans>
              </Typography>
            )}
          </Flex>
        </Box>
        <ColorPaletteCreator
          type={type}
          title={titleInput}
          colorValues={colorValues}
          onRemove={removeColor}
          onUpdate={updateColor}
          onAdd={addColor}
        />

        <Box className={classes.saveButtonContainer}>
          <Button
            onClick={saveColorPalette}
            disabled={
              colorValues.length === 0 || titleInput === "" || noChanges
            }
          >
            {formMode === "add" ? (
              <Trans id="controls.custom-color-palettes.create-palette">
                Create color palette
              </Trans>
            ) : (
              <Trans id="controls.custom-color-palettes.update-palette">
                Update color palette
              </Trans>
            )}
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
};

type ColorPaletteTypeSelectorProps = {
  onChange: (type: CustomPaletteType["type"]) => void;
  selectedType: CustomPaletteType["type"];
};

const ColorPaletteTypeSelector = ({
  onChange,
  selectedType,
}: ColorPaletteTypeSelectorProps) => {
  const types: CustomPaletteType["type"][] = [
    "categorical",
    "sequential",
    "diverging",
  ];
  const colorTypes: Record<CustomPaletteType["type"], string> = {
    sequential: t({
      id: "controls.custom-color-palettes.sequential",
    }),
    diverging: t({
      id: "controls.custom-color-palettes.diverging",
    }),
    categorical: t({
      id: "controls.custom-color-palettes.categorical",
    }),
  };

  const handleChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as CustomPaletteType["type"]);
  });

  return (
    <Box sx={{ fontSize: "1rem", pb: 2 }}>
      <Typography variant="caption" component="p" sx={{ mb: 2 }}>
        <Trans id="controls.custom-color-palettes.type" />
      </Typography>
      <RadioGroup>
        {types.map((type) => {
          return (
            <Flex
              key={`color-palettes-${type}`}
              flexDirection={"column"}
              gap={2}
            >
              <Radio
                label={colorTypes[type]}
                value={type}
                checked={type === selectedType}
                onChange={handleChange}
              />
              <ColorPaletteExample type={type} />
            </Flex>
          );
        })}
      </RadioGroup>
    </Box>
  );
};
