import { useEvent } from "@dnd-kit/utilities";
import { t } from "@lingui/macro";
import { Trans } from "@lingui/react";
import { Box, Button, capitalize, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback, useRef, useState } from "react";

import Flex from "@/components/flex";
import { Input, Label, Radio } from "@/components/form";
import { BackButton, CustomPaletteType } from "@/configurator";
import { ColorItem, ColorsByType, getDefaultColorValues } from "@/palettes";
import { theme } from "@/themes/federal";
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
    color: theme.palette.grey[800],
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

const ProfileColorPaletteForm = ({
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

    if (titleExistsAlready) {
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

  return (
    <Flex flexDirection="column" gap="30px">
      <BackButton className={classes.backButton} onClick={onBack}>
        <Trans id="login.profile.my-color-palettes.create.back-button">
          My palettes
        </Trans>
      </BackButton>

      <Flex
        flexDirection="column"
        gap={5}
        className={classes.colorPickerContainer}
      >
        <ColorPaletteTypeSelector
          onChange={handleTypeChange}
          selectedType={type}
        />
        <Typography variant="body2" color="textSecondary">
          <Trans id="controls.custom-color-palettes.caption">
            Use distinct, high-contrast colors. Avoid using too many colors,
            maximum 5–7. Apply sequential palettes for ordered data and
            diverging palettes for extremes.
          </Trans>
        </Typography>

        <Box className={classes.inputContainer}>
          <Flex flexDirection={"column"}>
            <Input
              error={isNotAvailable}
              label={t({ id: "controls.custom-color-palettes.title" })}
              name="custom-color-palette-title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
            {isNotAvailable && (
              <Typography color={"error.main"} variant="caption">
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

export default ProfileColorPaletteForm;

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

  const handleChange = useEvent((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as CustomPaletteType["type"]);
  });

  return (
    <Box sx={{ fontSize: "1rem", pb: 2 }}>
      <Label htmlFor="custom-color-palette-type" smaller sx={{ mb: 1 }}>
        <Trans id="controls.custom-color-palettes.type" />
      </Label>
      <Flex gap={6}>
        {types.map((type) => {
          return (
            <Flex
              key={`color-palettes-${type}`}
              flexDirection={"column"}
              gap={2}
            >
              <Radio
                label={capitalize(type)}
                value={type}
                checked={type === selectedType}
                onChange={handleChange}
              />
              <ColorPaletteExample type={type} />
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
