import { useEvent } from "@dnd-kit/utilities";
import { Trans } from "@lingui/react";
import { Box, Button, Grid, styled, Typography } from "@mui/material";
import { useState } from "react";

import Flex from "@/components/flex";
import VisuallyHidden from "@/components/visually-hidden";
import { CustomPaletteType } from "@/config-types";
import { ColorSquare } from "@/configurator/components/chart-controls/color-palette";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import { Icon } from "@/icons";
import {
  createDivergingInterpolator,
  createSequentialInterpolator,
} from "@/palettes";
import {
  deleteCustomColorPalette,
  getCustomColorPalettes,
} from "@/utils/chart-config/api";
import { useFetchData, useMutate } from "@/utils/use-fetch-data";

import { SectionContent } from "../profile-tables";

import { default as ProfileColorPaletteForm } from "./profile-color-palette-form";

type ProfileContentProps = {
  title: string;
  userId: number;
};

const ProfileColorPaletteContent = ({ title, userId }: ProfileContentProps) => {
  const { data: customColorPalettes, invalidate } = useFetchData({
    queryKey: ["colorPalettes", userId],
    queryFn: getCustomColorPalettes,
    options: {
      enable: !!userId,
    },
  });

  const [openColorPaletteConfig, setOpenColorPaletteConifg] = useState(false);
  const [paletteIdForEdit, setPaletteIdForEdit] = useState<string | null>(null);

  const editPalette = useEvent((paletteId: string) => {
    setPaletteIdForEdit(paletteId);
    setOpenColorPaletteConifg(true);
  });
  const createPalette = useEvent(() => {
    setPaletteIdForEdit(null);
    setOpenColorPaletteConifg(true);
  });

  const completeColorPaletteConfig = useEvent(() => {
    invalidate();
    setOpenColorPaletteConifg(false);
  });
  return (
    <SectionContent title={openColorPaletteConfig ? undefined : title}>
      {openColorPaletteConfig ? (
        <ProfileColorPaletteForm
          palette={customColorPalettes?.find(
            (palette) => palette.paletteId === paletteIdForEdit
          )}
          onBack={completeColorPaletteConfig}
        />
      ) : (
        <Flex flexDirection={"column"} width={385} gap={"30px"}>
          {customColorPalettes && customColorPalettes?.length > 0 ? (
            <Flex flexDirection={"column"} gap={1}>
              {customColorPalettes.map((palette) => {
                return (
                  <ColorPaletteRow
                    key={palette.paletteId}
                    paletteId={palette.paletteId}
                    name={palette.name}
                    colors={palette.colors}
                    type={palette.type}
                    onDelete={invalidate}
                    onEdit={editPalette}
                  />
                );
              })}
            </Flex>
          ) : (
            <Typography variant={"body2"}>
              <Trans id="login.profile.my-color-palettes.description" />
            </Typography>
          )}
          <Button
            color="primary"
            variant="contained"
            startIcon={<Icon name="add" />}
            sx={{ width: "fit-content" }}
            onClick={createPalette}
          >
            <Trans id="login.profile.my-color-palettes.add" />
          </Button>
        </Flex>
      )}
    </SectionContent>
  );
};

export default ProfileColorPaletteContent;

const EditButton = styled(Button)({
  padding: 0,
  minWidth: "auto",
  minHeight: "auto",
  lineHeight: "24px",
  backgroundColor: "transparent",
});

const DeleteButton = styled(Button)({
  padding: 0,
  minWidth: "auto",
  minHeight: "auto",
  lineHeight: "24px",
  backgroundColor: "transparent",
});

const ColorRowFlex = styled(Flex)({
  lineHeight: "16px",
  "& > button": {
    backgroundColor: "grey.100",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    p: 0,
  },
  "& > button:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
    opacity: 0.8,
  },
  "& > button[aria-expanded]": {
    borderColor: "primary.active",
  },
});

const ColorPaletteRow = ({
  colors,
  name,
  paletteId,
  type,
  onDelete,
  onEdit,
}: CustomPaletteType & {
  onDelete: () => void;
  onEdit: (paletteId: string) => void;
}) => {
  const deleteColorPalette = useMutate(deleteCustomColorPalette);

  const handleDelete = useEvent(async () => {
    await deleteColorPalette.mutate({ paletteId });
    onDelete();
  });

  return (
    <ColorRowFlex
      sx={{
        paddingY: 3,
        paddingRight: 4,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="caption">{name}</Typography>
        <Grid
          container
          spacing={0.5}
          sx={{
            display: "flex",
            width: "240px",
            alignItems: "center",
            "& .MuiGrid-item": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <ColorPaletteDisplay
            colors={colors}
            paletteId={paletteId}
            type={type}
          />
        </Grid>
      </Box>
      <ColorRowFlex gap={3}>
        <EditButton onClick={() => onEdit(paletteId)}>
          <Typography
            aria-hidden
            color="primary"
            sx={{ backgroundColor: "transparent" }}
          >
            <VisuallyHidden>
              <Trans id="login.profile.my-color-palettes.edit">
                Edit Color Palette
              </Trans>
            </VisuallyHidden>
            <Icon name="edit" size={24} />
          </Typography>
        </EditButton>
        <DeleteButton
          disabled={deleteColorPalette.status === "fetching"}
          onClick={handleDelete}
        >
          <VisuallyHidden>
            <Trans id="login.profile.my-color-palettes.delete">
              Delete Color Palette
            </Trans>
          </VisuallyHidden>
          <Typography
            aria-hidden
            color="primary"
            sx={{ backgroundColor: "transparent" }}
          >
            <Icon name="trash" size={24} />
          </Typography>
        </DeleteButton>
      </ColorRowFlex>
    </ColorRowFlex>
  );
};

const ColorPaletteDisplay = ({
  colors,
  paletteId,
  type,
}: Omit<CustomPaletteType, "name">) => {
  switch (type) {
    case "categorical":
      return (
        <>
          {colors.map((color, i) => (
            <Grid item key={`${paletteId}-${color}-${i}`}>
              <ColorSquare color={color as string} />
            </Grid>
          ))}
        </>
      );
    case "sequential":
      return (
        <ColorRamp
          height={20}
          width={240}
          colorInterpolator={
            createSequentialInterpolator(colors[0], colors[1]).interpolator
          }
        />
      );
    case "diverging":
      return (
        <ColorRamp
          height={20}
          width={240}
          colorInterpolator={
            createDivergingInterpolator(colors[0], colors[1], {
              midColor: colors[2] ?? undefined,
            }).interpolator
          }
        />
      );
    default:
      return (
        <>
          {colors.map((color, i) => (
            <Grid item key={`${paletteId}-${color}-${i}`}>
              <ColorSquare color={color as string} />
            </Grid>
          ))}
        </>
      );
  }
};
