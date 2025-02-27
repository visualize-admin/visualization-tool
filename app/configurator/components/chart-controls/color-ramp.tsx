import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ListSubheader,
  MenuItem,
  Select,
  SelectProps,
  Typography,
} from "@mui/material";
import get from "lodash/get";
import {
  Dispatch,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { Label } from "@/components/form";
import { getChartConfig } from "@/config-utils";
import {
  CustomPaletteType,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { useLocale } from "@/locales/use-locale";
import { useUser } from "@/login/utils";
import {
  createDivergingInterpolator,
  createSequentialInterpolator,
  divergingPalettes,
  getColorInterpolator,
  sequentialPalettes,
} from "@/palettes";
import { getFittingColorInterpolator } from "@/utils/color-palette-utils";
import useEvent from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

import { ConfiguratorDrawer } from "../drawer";

import { ColorPaletteDrawerContent } from "./drawer-color-palette-content";

// Adapted from https://observablehq.com/@mbostock/color-ramp

type ColorRampProps = {
  colorInterpolator: (t: number) => string;
  nSteps?: number;
  width?: number;
  height?: number;
  disabled?: boolean;
  rx?: number;
};

export const ColorRamp = (props: ColorRampProps) => {
  const {
    colorInterpolator,
    nSteps: _nSteps = 512,
    width = 220,
    height = 28,
    disabled,
    rx = 2,
  } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas && canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      const [stepWidth, nSteps] =
        _nSteps > width ? [1, width] : [width / _nSteps, _nSteps];

      for (let i = 0; i < nSteps; ++i) {
        ctx.fillStyle = colorInterpolator(i / (nSteps - 1));
        ctx.fillRect(stepWidth * i, 0, stepWidth, height);
      }
    }
  }, [colorInterpolator, _nSteps, width, height, disabled, rx]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        borderRadius: `${rx}px`,
        imageRendering: "pixelated",
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
};

type ColorRampFieldProps = Omit<ColorRampProps, "colorInterpolator"> & {
  field: EncodingFieldType;
  path: string;
};

export const ColorRampField = (props: ColorRampFieldProps) => {
  const { field, path, disabled, nSteps } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const { data: customColorPalettes, invalidate } = useUserPalettes();

  const palettes = useMemo(() => {
    const palettes = [...sequentialPalettes, ...divergingPalettes];
    return palettes;
  }, []);

  const currentPaletteId = get(
    chartConfig,
    `fields["${field}"].${path}.paletteId`
  );

  const currentPalette = palettes.find((d) => d.value === currentPaletteId);
  const currentCustomPalette = customColorPalettes?.find(
    (d) => d.paletteId === currentPaletteId
  );

  const onSelectedItemChange: SelectProps<typeof currentPalette>["onChange"] =
    useEvent((ev) => {
      const value = ev.target.value as string;

      const selectedPalette = customColorPalettes?.find(
        (palette) => palette.paletteId === value
      );

      handleChartConfigUpdate(value, selectedPalette);
    });

  const handleChartConfigUpdate = (
    value: string,
    selectedPalette?: CustomPaletteType
  ) => {
    if (value) {
      dispatch({
        type: "COLOR_FIELD_UPDATED",
        value: {
          locale,
          field,
          path,
          value: {
            ...get(chartConfig, `fields["${field}"].${path}`),
            paletteId: value,
            paletteType: selectedPalette?.type,
            colors: selectedPalette?.colors ?? [],
          },
        },
      });
    }
  };

  const [type, setType] = useState<CustomPaletteType["type"] | undefined>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenCreateColorPalette: MouseEventHandler<HTMLButtonElement> =
    useEvent((ev) => {
      setAnchorEl(ev.currentTarget);
    });
  const handleCloseCreateColorPalette = useEvent(
    (palette?: CustomPaletteType) => {
      invalidate();
      setAnchorEl(undefined);

      if (palette) {
        handleChartConfigUpdate(palette.paletteId, palette);
      }

      anchorEl?.focus();
    }
  );

  const selectedColorInterpolator = getFittingColorInterpolator(
    {
      currentPalette,
      customPalette: currentCustomPalette,
      defaultPalette: palettes[0],
    },
    getColorInterpolator
  );

  return (
    <Box pb={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label smaller sx={{ mb: 1 }} htmlFor="color-palette">
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Select
        value={currentPaletteId}
        disabled={disabled}
        sx={{
          width: "100%",
          "& .MuiSelect-select": { height: "44px", width: "100%" },
        }}
        displayEmpty
        onChange={onSelectedItemChange}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography color={"secondary.active"} variant="body2">
                <Trans id="controls.color.palette.select">
                  Select a color palette
                </Trans>
              </Typography>
            );
          }
          return (
            <ColorRamp
              colorInterpolator={selectedColorInterpolator}
              nSteps={nSteps}
              disabled={disabled}
            />
          );
        }}
      >
        {[
          ...PaletteSection({
            type: "sequential",
            onTypeSelect: setType,
            nSteps: nSteps,
            customColorPalettes: customColorPalettes,
            colorPalettes: sequentialPalettes,
            handleAddColorPalette: handleOpenCreateColorPalette,
            customInterpolator: createSequentialInterpolator,
          }),
          ...PaletteSection({
            type: "diverging",
            onTypeSelect: setType,
            nSteps: nSteps,
            customColorPalettes: customColorPalettes,
            colorPalettes: divergingPalettes,
            handleAddColorPalette: handleOpenCreateColorPalette,
            customInterpolator: createDivergingInterpolator,
          }),
        ]}
      </Select>
      {type && (
        <ConfiguratorDrawer open={!!anchorEl} hideBackdrop>
          <ColorPaletteDrawerContent
            onClose={(palette) => handleCloseCreateColorPalette(palette)}
            type={type}
            customColorPalettes={customColorPalettes}
          />
        </ConfiguratorDrawer>
      )}
    </Box>
  );
};

type PaletteSectionProps = {
  nSteps?: number;
  customColorPalettes?: CustomPaletteType[];
  colorPalettes: { value: string; interpolator: (t: number) => string }[];
  handleAddColorPalette: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  onTypeSelect: Dispatch<SetStateAction<CustomPaletteType["type"] | undefined>>;
  customInterpolator:
    | typeof createDivergingInterpolator
    | typeof createSequentialInterpolator;
  type: CustomPaletteType["type"];
};

const PaletteSection = (props: PaletteSectionProps) => {
  const user = useUser();
  const {
    type,
    nSteps,
    customColorPalettes,
    colorPalettes,
    onTypeSelect,
    customInterpolator,
    handleAddColorPalette,
  } = props;

  return [
    type === "diverging" ? (
      <ListSubheader>
        <Trans id="controls.color.palette.diverging">Diverging</Trans>
      </ListSubheader>
    ) : (
      <ListSubheader>
        <Trans id="controls.color.palette.sequential">Sequential</Trans>
      </ListSubheader>
    ),
    user && (
      <Button
        onClick={(e) => {
          onTypeSelect(type);
          handleAddColorPalette(e);
        }}
        variant="text"
        sx={{
          width: "100%",
          paddingY: 3,
          paddingX: 4,
        }}
      >
        <Trans id="login.profile.my-color-palettes.add">
          Add color palette
        </Trans>
      </Button>
    ),
    user && (
      <ListSubheader>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          fontSize={10}
          align="left"
        >
          <Trans id="controls.custom-color-palettes">
            Custom color palettes
          </Trans>
        </Typography>
      </ListSubheader>
    ),
    user &&
      customColorPalettes
        ?.filter((palette) => palette.type === type)
        .map((palette) => {
          return (
            <MenuItem
              sx={{ flexDirection: "column", alignItems: "flex-start" }}
              key={`${type}-${palette.paletteId}`}
              value={palette.paletteId}
            >
              <Typography variant="caption">{palette.name}</Typography>
              <ColorRamp
                colorInterpolator={
                  customInterpolator({
                    endColorHex: palette.colors[0],
                    startColorHex: palette.colors[1],
                    options: {
                      midColorHex: palette.colors[2] ?? undefined,
                    },
                  }).interpolator
                }
                nSteps={nSteps}
              />
            </MenuItem>
          );
        }),
    user && (
      <ListSubheader>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          fontSize={10}
          align="left"
        >
          <Trans id="controls.visualize-color-palette">
            Visualize color palettes
          </Trans>
        </Typography>
      </ListSubheader>
    ),
    colorPalettes.map(({ value, interpolator }, i) => (
      <MenuItem
        sx={{ flexDirection: "column", alignItems: "flex-start" }}
        key={`${type}-${i}`}
        value={value}
      >
        <ColorRamp colorInterpolator={interpolator} nSteps={nSteps} />
      </MenuItem>
    )),
  ];
};
