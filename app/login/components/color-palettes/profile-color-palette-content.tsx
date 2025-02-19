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

export const ProfileColorPaletteContent = ({
  title,
  userId,
}: ProfileContentProps) => {
  const { data: customColorPalettes, invalidate } = useFetchData({
    queryKey: ["colorPalettes", userId],
    queryFn: getCustomColorPalettes,
    options: {
      enable: !!userId,
    },
  });

  type FormMode = "add" | "edit" | "view";
  const [formMode, setFormMode] = useState<FormMode>("view");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    null
  );

  const showAddForm = useEvent(() => {
    setSelectedPaletteId(null);
    setFormMode("add");
  });

  const showEditForm = useEvent((paletteId: string) => {
    setSelectedPaletteId(paletteId);
    setFormMode("edit");
  });

  const returnToView = useEvent(() => {
    invalidate();
    setFormMode("view");
  });

  const selectedPalette = customColorPalettes?.find(
    (palette) => palette.paletteId === selectedPaletteId
  );

  return (
    <SectionContent title={formMode === "view" ? title : undefined}>
      {formMode === "view" ? (
        <Flex flexDirection="column" width={385} gap="30px">
          {customColorPalettes && customColorPalettes.length > 0 ? (
            <Flex flexDirection="column" gap={1}>
              {customColorPalettes.map((palette) => (
                <ColorPaletteRow
                  key={palette.paletteId}
                  paletteId={palette.paletteId}
                  name={palette.name}
                  colors={palette.colors}
                  type={palette.type}
                  onDelete={invalidate}
                  onEdit={showEditForm}
                />
              ))}
            </Flex>
          ) : (
            <Typography variant="body2">
              <Trans id="login.profile.my-color-palettes.description" />
            </Typography>
          )}
          <Button
            color="primary"
            variant="contained"
            startIcon={<Icon name="add" />}
            sx={{ width: "fit-content" }}
            onClick={showAddForm}
            data-testId="add-profile-color-palette"
          >
            <Trans id="login.profile.my-color-palettes.add" />
          </Button>
        </Flex>
      ) : (
        <ProfileColorPaletteForm
          formMode={formMode}
          palette={formMode === "edit" ? selectedPalette : undefined}
          onBack={returnToView}
        />
      )}
    </SectionContent>
  );
};

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
      data-testId="profile-color-palette-row"
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
          <VisuallyHidden>
            <Trans id="login.profile.my-color-palettes.edit">
              Edit Color Palette
            </Trans>
          </VisuallyHidden>
          <Typography
            aria-hidden
            color="primary"
            sx={{ backgroundColor: "transparent" }}
          >
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
            createSequentialInterpolator({
              endColorHex: colors[0],
              startColorHex: colors[1],
            }).interpolator
          }
        />
      );
    case "diverging":
      return (
        <ColorRamp
          height={20}
          width={240}
          colorInterpolator={
            createDivergingInterpolator({
              endColorHex: colors[0],
              startColorHex: colors[1],
              options: {
                midColorHex: colors[2] ?? undefined,
              },
            }).interpolator
          }
        />
      );
    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
};
