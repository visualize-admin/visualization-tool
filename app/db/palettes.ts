import {
  convertDBTypeToPaletteType,
  convertPaletteTypeToDBType,
  CustomPaletteType,
} from "@/config-types";
import { prisma } from "@/db/client";
import {
  CreateCustomColorPalette,
  UpdateCustomColorPalette,
} from "@/utils/chart-config/api";

export const createPaletteForUser = async (
  data: CreateCustomColorPalette & { user_id: number }
): Promise<CustomPaletteType> => {
  const palette = await prisma.palette.create({
    data: {
      name: data.name,
      type: convertPaletteTypeToDBType(data.type),
      colors: data.colors,
      user_id: data.user_id,
      updated_at: new Date(),
    },
  });

  return {
    ...palette,
    type: convertDBTypeToPaletteType(palette.type),
  };
};

export const getPalettesForUser = async ({
  user_id,
}: {
  user_id: number;
}): Promise<CustomPaletteType[]> => {
  const palettes = await prisma.palette.findMany({
    where: {
      user_id,
    },
  });

  return palettes.map((palette) => {
    return {
      paletteId: palette.paletteId,
      name: palette.name,
      colors: palette.colors,
      type: convertDBTypeToPaletteType(palette.type),
    };
  });
};

export const deletePaletteForUser = async ({
  paletteId,
  user_id,
}: {
  paletteId: string;
  user_id: number;
}) => {
  await prisma.palette.delete({
    where: {
      paletteId_user_id: {
        paletteId,
        user_id,
      },
    },
  });
};

export const updatePaletteForUser = async ({
  type,
  paletteId,
  name,
  colors,
  user_id,
}: UpdateCustomColorPalette & { user_id: number }) => {
  const dbType = type && convertPaletteTypeToDBType(type);

  await prisma.palette.update({
    where: {
      paletteId_user_id: {
        paletteId,
        user_id,
      },
    },
    data: {
      name,
      colors,
      type: dbType,
      updated_at: new Date(),
    },
  });
};
