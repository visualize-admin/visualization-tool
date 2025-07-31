import { useEvent } from "@dnd-kit/utilities";
import { Trans } from "@lingui/macro";
import { Button, Grid, IconButton, styled, Typography } from "@mui/material";
import { useState } from "react";

import { Flex } from "@/components/flex";
import { VisuallyHidden } from "@/components/visually-hidden";
import { CustomPaletteType } from "@/config-types";
import { ColorSquare } from "@/configurator/components/chart-controls/color-palette";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import { Icon } from "@/icons";
import { ProfileColorPaletteForm } from "@/login/components/color-palettes/profile-color-palette-form";
import { SectionContent } from "@/login/components/profile-tables";
import {
  createDivergingInterpolator,
  createSequentialInterpolator,
} from "@/palettes";
import { deleteCustomColorPalette } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";
import { useUserPalettes } from "@/utils/use-user-palettes";

type ProfileContentProps = {
  title: string;
};

export const ProfileColorPaletteContent = ({ title }: ProfileContentProps) => {
  const { data: customColorPalettes, invalidate } = useUserPalettes();

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
            size="sm"
            startIcon={<Icon name="plus" />}
            sx={{ width: "fit-content" }}
            onClick={showAddForm}
          >
            <Trans id="login.profile.my-color-palettes.add">
              Add color palette
            </Trans>
          </Button>
        </Flex>
      ) : (
        <ProfileColorPaletteForm
          formMode={formMode}
          palette={formMode === "edit" ? selectedPalette : undefined}
          onBack={returnToView}
          customColorPalettes={customColorPalettes}
        />
      )}
    </SectionContent>
  );
};

const EditButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: "auto",
  backgroundColor: "transparent",
  lineHeight: 0,
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: "auto",
  backgroundColor: "transparent",
  lineHeight: 0,
}));

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
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: 3,
        pr: 4,
      }}
    >
      <div>
        <Typography variant="caption">{name}</Typography>
        <Grid
          container
          spacing={0.5}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "240px",

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
      </div>
      <Flex gap={2.5}>
        <EditButton onClick={() => onEdit(paletteId)}>
          <Typography
            component="span"
            color="text.primary"
            aria-hidden
            style={{ lineHeight: 0 }}
          >
            <VisuallyHidden>
              <Trans id="login.profile.my-color-palettes.edit">
                Edit Color Palette
              </Trans>
            </VisuallyHidden>
            <Icon name="pen" size={24} />
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
            component="span"
            color="text.primary"
            aria-hidden
            style={{ lineHeight: 0 }}
          >
            <Icon name="trash" size={24} />
          </Typography>
        </DeleteButton>
      </Flex>
    </Flex>
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
              <ColorSquare color={color} />
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
