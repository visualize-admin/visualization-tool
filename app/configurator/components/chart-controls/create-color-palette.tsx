import { useEvent } from "@dnd-kit/utilities";
import { t } from "@lingui/macro";
import { Trans } from "@lingui/react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { nanoid } from "nanoid";
import { forwardRef, useState } from "react";

import Flex from "@/components/flex";
import { Input } from "@/components/form";
import { CustomPaletteType } from "@/config-types";
import SvgIcClose from "@/icons/components/IcClose";
import ColorPaletteCreator from "@/login/components/color-palettes/color-palette-types";
import { ColorItem, defaultColorValues } from "@/palettes";
import { theme } from "@/themes/federal";
import { createCustomColorPalette } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";

import { DRAWER_WIDTH } from "../drawer";

const useStyles = makeStyles({
  autocompleteMenuContent: {
    "--mx": "1rem",
    "--colorBoxSize": "1.25rem",
    "--columnGap": "0.75rem",
    width: DRAWER_WIDTH,
  },
  autocompleteHeader: {
    margin: "1rem var(--mx)",
  },
  autocompleteApplyButtonContainer: {
    padding: "1rem var(--mx)",
    background: "rgba(255,255,255,0.75)",
  },
  textInput: {
    margin: `${theme.spacing(4)} 0px`,
    padding: "30px",
    width: "100%",
    height: 40,
    minHeight: 40,
  },
  autocompleteApplyButton: {
    justifyContent: "center",
  },
});

export const DrawerContent = forwardRef<
  HTMLDivElement,
  {
    onClose: (palette?: CustomPaletteType) => void;
    type: CustomPaletteType["type"];
    customColorPalettes?: CustomPaletteType[];
  }
>((props, ref) => {
  const { onClose, type, customColorPalettes } = props;
  const classes = useStyles();

  const [colorValues, setColorValues] = useState<ColorItem[]>(() =>
    defaultColorValues(type, [])
  );

  const [titleInput, setTitleInput] = useState<string>("");
  const [isNotAvailable, setIsNotAvailable] = useState(false);

  const createColorPalette = useMutate(createCustomColorPalette);

  const updateColor = useEvent((color: string, id: string) => {
    setColorValues((prevColors) => {
      const newColors = prevColors.map((oldColor) =>
        oldColor.id === id ? { ...oldColor, color } : oldColor
      );
      return newColors;
    });
  });

  const removeColor = useEvent((colorId: string) => {
    setColorValues((prevColors) => {
      const newColors = prevColors.filter(
        (oldColor) => oldColor.id !== colorId
      );
      return newColors;
    });
  });

  const addColor = useEvent(() => {
    setColorValues((prevColors) => {
      const newColors = [...prevColors, { color: "#000000", id: nanoid(4) }];
      return newColors;
    });
  });

  const saveColorPalette = useEvent(async () => {
    const titleExistsAlready = customColorPalettes?.find(
      (palette) => palette.name === titleInput
    );
    if (titleExistsAlready) {
      setIsNotAvailable(true);
    } else {
      setIsNotAvailable(false);
      const palette = await createColorPalette.mutate({
        name: titleInput,
        colors: colorValues.map((c) => c.color),
        type,
      });

      onClose(palette);
    }
  });

  return (
    <div
      className={classes.autocompleteMenuContent}
      ref={ref}
      data-testid="colors-filters-drawer"
    >
      <Box className={classes.autocompleteHeader}>
        <Flex alignItems="center" justifyContent="space-between">
          <Typography
            variant="h4"
            sx={{
              py: 4,
            }}
          >
            <Trans id="controls.custom-color-palettes">
              Custom color palettes
            </Trans>
          </Typography>
          <IconButton
            sx={{ mt: "-0.5rem" }}
            size="small"
            onClick={() => onClose()}
          >
            <SvgIcClose fontSize="inherit" />
          </IconButton>
        </Flex>
        <Typography variant="body2" color="textSecondary">
          <Trans id="controls.custom-color-palettes.caption">
            Use distinct, high-contrast colors. Avoid using too many colors,
            maximum 5–7. Apply sequential palettes for ordered data and
            diverging palettes for extremes.
          </Trans>
        </Typography>
      </Box>
      <Flex
        sx={{
          mt: 4,
          gap: 4,
          paddingX: "1rem",
        }}
        flexDirection={"column"}
      >
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
        <ColorPaletteCreator
          type={type}
          colorValues={colorValues}
          onRemove={removeColor}
          onUpdate={updateColor}
          onAdd={addColor}
        />
      </Flex>

      <Box className={classes.autocompleteApplyButtonContainer}>
        <Button
          disabled={colorValues.length === 0 || titleInput === ""}
          className={classes.autocompleteApplyButton}
          onClick={saveColorPalette}
        >
          <Trans id="controls.custom-color-palettes.set-values-apply">
            Save color palette
          </Trans>
        </Button>
      </Box>
    </div>
  );
});
